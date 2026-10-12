import os
import uuid
import time
import json
import requests
from typing import List, Optional, Dict, Any
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ApiRoute, ServerlessFunction, ExecutionLog, ActivityFeed
from app.schemas import ApiRouteResponse, ApiRouteCreate, ApiRouteUpdate
from app.auth import get_current_user
from app.quotas import check_api_routes_quota, increment_api_request_count
from app.config import settings

router = APIRouter(tags=["API Gateway"])

# In-memory rate limiting tracker: (route_id, ip) -> list of timestamps
rate_limit_buckets = defaultdict(list)

def is_rate_limited(route_id: str, client_ip: str, rpm: int) -> bool:
    now = time.time()
    key = f"{route_id}_{client_ip}"
    # Keep only requests within the last 60 seconds
    rate_limit_buckets[key] = [t for t in rate_limit_buckets[key] if now - t < 60]
    if len(rate_limit_buckets[key]) >= rpm:
        return True
    rate_limit_buckets[key].append(now)
    return False

# ====================================================================
# Configuration / Management Endpoints (Requires User Auth)
# ====================================================================

@router.get("/api/gateway/routes", response_model=List[ApiRouteResponse])
def list_api_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routes = db.query(ApiRoute).filter(
        ApiRoute.user_id == current_user.id
    ).order_by(ApiRoute.created_at.desc()).all()
    
    result = []
    for r in routes:
        clean_path = r.path.strip("/")
        func_name = r.function.name if r.function else "Unknown"
        endpoint_url = f"/gateway/{current_user.id}/{clean_path}"
        result.append(ApiRouteResponse(
            id=r.id,
            function_id=r.function_id,
            function_name=func_name,
            path=r.path,
            http_method=r.http_method,
            endpoint_url=endpoint_url,
            requires_api_key=r.requires_api_key,
            api_key=r.api_key,
            rate_limit_rpm=r.rate_limit_rpm,
            is_active=r.is_active,
            requests_count=r.requests_count,
            created_at=r.created_at
        ))
    return result

@router.post("/api/gateway/routes", response_model=ApiRouteResponse)
def create_api_route(
    data: ApiRouteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_api_routes_quota(db, current_user)
    
    clean_path = data.path.strip("/").lower()
    method = data.http_method.upper()

    existing = db.query(ApiRoute).filter(
        ApiRoute.user_id == current_user.id,
        ApiRoute.path == clean_path,
        ApiRoute.http_method == method
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A route with this path and method already exists")

    # Check that function belongs to user
    func = db.query(ServerlessFunction).filter(
        ServerlessFunction.id == data.function_id,
        ServerlessFunction.user_id == current_user.id
    ).first()
    if not func:
        raise HTTPException(status_code=404, detail="Target function not found")

    route_id = f"rt_{uuid.uuid4().hex[:10]}"
    api_key = f"mk_live_{uuid.uuid4().hex[:16]}" if data.requires_api_key else None

    new_route = ApiRoute(
        id=route_id,
        user_id=current_user.id,
        function_id=data.function_id,
        path=clean_path,
        http_method=method,
        requires_api_key=data.requires_api_key or False,
        api_key=api_key,
        rate_limit_rpm=data.rate_limit_rpm or 60,
        is_active=True,
        requests_count=0
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)

    endpoint_url = f"/gateway/{current_user.id}/{clean_path}"
    return ApiRouteResponse(
        id=new_route.id,
        function_id=new_route.function_id,
        function_name=func.name,
        path=new_route.path,
        http_method=new_route.http_method,
        endpoint_url=endpoint_url,
        requires_api_key=new_route.requires_api_key,
        api_key=new_route.api_key,
        rate_limit_rpm=new_route.rate_limit_rpm,
        is_active=new_route.is_active,
        requests_count=new_route.requests_count,
        created_at=new_route.created_at
    )

@router.delete("/api/gateway/routes/{route_id}")
def delete_api_route(
    route_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    route = db.query(ApiRoute).filter(
        ApiRoute.id == route_id,
        ApiRoute.user_id == current_user.id
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    db.delete(route)
    db.commit()
    return {"status": "deleted", "id": route_id}

# ====================================================================
# Live API Gateway Invocation Handler
# Matches: /gateway/{user_id}/{route_path:path}
# ====================================================================

@router.api_route("/gateway/{user_id}/{route_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def invoke_gateway_endpoint(
    user_id: str,
    route_path: str,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    clean_path = route_path.strip("/").lower()
    method = request.method.upper()

    # Find matching route
    route = db.query(ApiRoute).filter(
        ApiRoute.user_id == user_id,
        ApiRoute.path == clean_path,
        ApiRoute.http_method.in_([method, "ANY"])
    ).first()

    if not route or not route.is_active:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Not Found",
                "message": f"No active API Gateway route found for {method} /{clean_path}",
                "user_id": user_id
            }
        )

    # 1. API Key check
    if route.requires_api_key:
        passed_key = request.headers.get("X-Api-Key") or request.query_params.get("api_key")
        if not passed_key or passed_key != route.api_key:
            return JSONResponse(
                status_code=401,
                content={"error": "Unauthorized", "message": "Invalid or missing API Key"}
            )

    # 2. Rate Limit check
    if is_rate_limited(route.id, client_ip, route.rate_limit_rpm):
        return JSONResponse(
            status_code=429,
            content={
                "error": "Too Many Requests",
                "message": f"Rate limit exceeded ({route.rate_limit_rpm} req/min). Try again shortly.",
                "retry_after_seconds": 15
            }
        )

    # 3. Check Quota & increment
    increment_api_request_count(db, user_id)
    route.requests_count += 1
    db.commit()

    # 4. Prepare Event Payload
    body_data = {}
    try:
        raw_body = await request.body()
        if raw_body:
            body_data = json.loads(raw_body.decode("utf-8"))
    except Exception:
        body_data = {"raw": raw_body.decode("utf-8", errors="ignore") if raw_body else ""}

    event = {
        "http_method": method,
        "path": f"/{clean_path}",
        "query_params": dict(request.query_params),
        "headers": dict(request.headers),
        "body": body_data,
        "client_ip": client_ip,
        "request_time": time.time()
    }

    func = route.function
    if not func:
        return JSONResponse(status_code=500, content={"error": "Target function deleted or unavailable"})

    # 5. Call Execution Tier EC2-3
    payload = {
        "function_id": func.id,
        "function_name": func.name,
        "code": func.code,
        "event": event,
        "timeout_seconds": func.timeout_seconds or 5
    }

    try:
        resp = requests.post(
            f"{settings.RUNNER_SERVICE_URL}/run",
            json=payload,
            timeout=(func.timeout_seconds or 5) + 2
        )
        run_res = resp.json()
    except Exception as e:
        # Fallback local runner
        run_res = {
            "status": "error",
            "duration_ms": 1.0,
            "memory_used_mb": 12.0,
            "stdout": "",
            "stderr": f"Error contacting execution tier: {e}",
            "return_value": None,
            "error_message": str(e)
        }

    # 6. Record Log
    log_entry = ExecutionLog(
        id=f"log_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        function_id=func.id,
        function_name=func.name,
        trigger_type="api_gateway",
        status=run_res.get("status", "error"),
        duration_ms=run_res.get("duration_ms", 0.0),
        memory_used_mb=run_res.get("memory_used_mb", 16.0),
        stdout=run_res.get("stdout"),
        stderr=run_res.get("stderr"),
        return_value=run_res.get("return_value"),
        error_message=run_res.get("error_message"),
        ip_address=client_ip
    )
    db.add(log_entry)

    # Activity feed
    act = ActivityFeed(
        id=f"act_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        action_type="api_call",
        title=f"API /{clean_path} called",
        details=f"{method} /{clean_path} returned 200 OK in {run_res.get('duration_ms', 0)}ms",
        status="success" if run_res.get("status") == "success" else "error"
    )
    db.add(act)
    db.commit()

    # Parse return value
    return_val = run_res.get("return_value")
    if return_val:
        try:
            parsed = json.loads(return_val)
            return JSONResponse(status_code=200, content=parsed)
        except Exception:
            return Response(content=str(return_val), media_type="text/plain")

    if run_res.get("status") == "error":
        return JSONResponse(
            status_code=500,
            content={
                "error": "Function execution error",
                "details": run_res.get("stderr") or run_res.get("error_message")
            }
        )

    return JSONResponse(status_code=200, content={"status": "success", "message": "Function executed with no output"})

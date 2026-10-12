import os
import uuid
import datetime
import requests
import psutil
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import User, ExecutionLog, ActivityFeed
from app.schemas import ExecutionLogResponse
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/monitoring", tags=["Function Monitoring & CloudWatch"])

@router.get("/logs", response_model=List[ExecutionLogResponse])
def get_execution_logs(
    function_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    trigger_filter: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ExecutionLog).filter(ExecutionLog.user_id == current_user.id)
    if function_id:
        query = query.filter(ExecutionLog.function_id == function_id)
    if status_filter:
        query = query.filter(ExecutionLog.status == status_filter)
    if trigger_filter:
        query = query.filter(ExecutionLog.trigger_type == trigger_filter)

    logs = query.order_by(desc(ExecutionLog.created_at)).limit(limit).all()
    return logs

@router.get("/stats")
def get_monitoring_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(func.count(ExecutionLog.id)).filter(ExecutionLog.user_id == current_user.id).scalar() or 0
    success = db.query(func.count(ExecutionLog.id)).filter(
        ExecutionLog.user_id == current_user.id,
        ExecutionLog.status == "success"
    ).scalar() or 0
    errors = db.query(func.count(ExecutionLog.id)).filter(
        ExecutionLog.user_id == current_user.id,
        ExecutionLog.status != "success"
    ).scalar() or 0
    avg_duration = db.query(func.avg(ExecutionLog.duration_ms)).filter(
        ExecutionLog.user_id == current_user.id
    ).scalar() or 0.0

    success_rate = round((success / total) * 100, 1) if total > 0 else 100.0

    return {
        "total_invocations": total,
        "success_count": success,
        "error_count": errors,
        "success_rate_percent": success_rate,
        "avg_duration_ms": round(float(avg_duration), 2)
    }

@router.get("/chart_data")
def get_monitoring_chart_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Last 10 executions for duration graph
    recent = db.query(ExecutionLog).filter(
        ExecutionLog.user_id == current_user.id
    ).order_by(desc(ExecutionLog.created_at)).limit(10).all()
    recent.reverse()

    data_points = []
    for log in recent:
        data_points.append({
            "timestamp": log.created_at.strftime("%H:%M:%S") if log.created_at else "",
            "function": log.function_name,
            "duration_ms": log.duration_ms,
            "status": log.status
        })

    return {
        "execution_timeline": data_points
    }

@router.get("/system_tiers")
def get_system_tiers_health():
    """Returns real-time health and connectivity metrics for all 3 EC2 instances."""
    # EC2-1 App Tier (Local)
    ec2_1 = {
        "name": "EC2 Instance 1 — Application Tier",
        "public_ip": settings.EC2_1_PUBLIC_IP,
        "private_ip": settings.EC2_1_APP_IP,
        "role": "Next.js Console, Backend API, API Gateway",
        "status": "online",
        "cpu_percent": psutil.cpu_percent(interval=None),
        "memory_percent": psutil.virtual_memory().percent
    }

    # EC2-2 Data Tier
    ec2_2_status = "checking"
    ec2_2_metrics = {}
    try:
        r = requests.get(f"{settings.STORAGE_SERVICE_URL}/health", timeout=2)
        if r.status_code == 200:
            ec2_2_status = "online"
            ec2_2_metrics = r.json()
    except Exception:
        ec2_2_status = "connecting"

    ec2_2 = {
        "name": "EC2 Instance 2 — Data Tier",
        "public_ip": settings.EC2_2_PUBLIC_IP,
        "private_ip": settings.EC2_2_DATA_IP,
        "role": "PostgreSQL, S3 Storage, Static Web Hosting",
        "status": ec2_2_status,
        "details": ec2_2_metrics
    }

    # EC2-3 Execution Tier
    ec2_3_status = "checking"
    ec2_3_metrics = {}
    try:
        r = requests.get(f"{settings.SCHEDULER_SERVICE_URL}/api/metrics/system", timeout=2)
        if r.status_code == 200:
            ec2_3_status = "online"
            ec2_3_metrics = r.json()
    except Exception:
        ec2_3_status = "connecting"

    ec2_3 = {
        "name": "EC2 Instance 3 — Execution & Monitoring Tier",
        "public_ip": settings.EC2_3_PUBLIC_IP,
        "private_ip": settings.EC2_3_EXEC_IP,
        "role": "Python Runner, Scheduler, Prometheus Metrics",
        "status": ec2_3_status,
        "details": ec2_3_metrics
    }

    return {
        "tiers": [ec2_1, ec2_2, ec2_3],
        "all_connected": ec2_2_status == "online" and ec2_3_status == "online"
    }

@router.post("/internal/record_log")
def internal_record_log(log_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Called by EC2-3 Scheduler to record scheduled runs."""
    entry = ExecutionLog(
        id=f"log_{uuid.uuid4().hex[:12]}",
        user_id=log_data.get("user_id"),
        function_id=log_data.get("function_id"),
        function_name=log_data.get("function_name", "unknown"),
        trigger_type=log_data.get("trigger_type", "schedule"),
        status=log_data.get("status", "success"),
        duration_ms=log_data.get("duration_ms", 0.0),
        memory_used_mb=log_data.get("memory_used_mb", 16.0),
        stdout=log_data.get("stdout"),
        stderr=log_data.get("stderr"),
        return_value=log_data.get("return_value"),
        error_message=log_data.get("error_message")
    )
    db.add(entry)

    # Activity feed
    act = ActivityFeed(
        id=f"act_{uuid.uuid4().hex[:12]}",
        user_id=log_data.get("user_id"),
        action_type="func_exec",
        title=f"Function {log_data.get('function_name')} executed",
        details=f"Scheduled run completed in {log_data.get('duration_ms', 0)}ms",
        status=log_data.get("status", "success")
    )
    db.add(act)
    db.commit()
    return {"status": "recorded"}

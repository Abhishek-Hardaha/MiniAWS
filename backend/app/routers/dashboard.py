import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import (
    User, StorageFile, HostedWebsite, ServerlessFunction,
    ApiRoute, ActivityFeed
)
from app.schemas import DashboardSummaryResponse, ActivityFeedResponse, UserResponse
from app.auth import get_current_user
from app.quotas import get_user_quota_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def format_time_ago(dt: datetime.datetime) -> str:
    if not dt:
        return "recently"
    now = datetime.datetime.utcnow()
    # handle timezone-aware or naive
    if dt.tzinfo is not None:
        now = datetime.datetime.now(datetime.timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    days = hours // 24
    return f"{days} day{'s' if days > 1 else ''} ago"

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Quotas
    quotas = get_user_quota_summary(db, current_user)

    # 2. Service counts
    files_count = db.query(func.count(StorageFile.id)).filter(StorageFile.user_id == current_user.id).scalar() or 0
    sites_count = db.query(func.count(HostedWebsite.id)).filter(HostedWebsite.user_id == current_user.id).scalar() or 0
    funcs_count = db.query(func.count(ServerlessFunction.id)).filter(ServerlessFunction.user_id == current_user.id).scalar() or 0
    routes_count = db.query(func.count(ApiRoute.id)).filter(ApiRoute.user_id == current_user.id).scalar() or 0

    # 3. Recent activities
    activities = db.query(ActivityFeed).filter(
        ActivityFeed.user_id == current_user.id
    ).order_by(desc(ActivityFeed.created_at)).limit(10).all()

    recent_feed = []
    for a in activities:
        recent_feed.append(ActivityFeedResponse(
            id=a.id,
            action_type=a.action_type,
            title=a.title,
            details=a.details,
            status=a.status,
            created_at=a.created_at,
            time_ago=format_time_ago(a.created_at)
        ))


    return DashboardSummaryResponse(
        user=UserResponse.from_orm(current_user),
        quotas=quotas,
        recent_activity=recent_feed,
        service_counts={
            "files": files_count,
            "websites": sites_count,
            "functions": funcs_count,
            "routes": routes_count
        },
        system_status={
            "status": "healthy",
            "tier_1_app": "online",
            "tier_2_data": "online",
            "tier_3_execution": "online"
        }
    )

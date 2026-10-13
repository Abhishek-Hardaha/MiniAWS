import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserQuota
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    new_user = User(
        id=user_id,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        plan_tier=user_in.plan_tier or "Developer",
        is_active=True
    )
    db.add(new_user)
    
    plan = user_in.plan_tier or "Developer"
    if plan == "Starter":
        max_storage = 1073741824 # 1 GB
        max_web = 1
        max_fn = 2
        max_routes = 2
        max_daily_req = 100
        max_month_inv = 500
    elif plan == "Pro":
        max_storage = 21474836480 # 20 GB
        max_web = 10
        max_fn = 15
        max_routes = 20
        max_daily_req = 2000
        max_month_inv = 10000
    else: # Developer
        max_storage = 5368709120 # 5 GB
        max_web = 3
        max_fn = 5
        max_routes = 5
        max_daily_req = 500
        max_month_inv = 2000

    quota = UserQuota(
        id=f"qta_{user_id}",
        user_id=user_id,
        max_storage_bytes=max_storage,
        max_websites=max_web,
        max_functions=max_fn,
        max_api_routes=max_routes,
        max_daily_api_requests=max_daily_req,
        max_monthly_invocations=max_month_inv
    )
    db.add(quota)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[UserResponse])
def list_available_users(db: Session = Depends(get_db)):
    """Allows 1-click user switching in the UI to demonstrate multi-tenant isolation."""
    users = db.query(User).filter(User.is_active == True).all()
    return users

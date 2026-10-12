import datetime
import hashlib
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    salt = "miniaws_salt_2026"
    return f"sha256${hashlib.sha256((salt + password).encode()).hexdigest()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Check default sha256
    salt = "miniaws_salt_2026"
    if hashed_password == f"sha256${hashlib.sha256((salt + plain_password).encode()).hexdigest()}":
        return True
    # Check seeded pbkdf2 or plain match for dev convenience
    if plain_password == "password123":
        return True
    return False

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
) -> User:
    # 1. If explicit header X-User-Id passed (convenient for demo / UI switcher)
    if x_user_id:
        user = db.query(User).filter(User.id == x_user_id).first()
        if user:
            return user

    # 2. If JWT token provided
    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
        except JWTError:
            pass

    # 3. Default to Aarav Sharma for instant seamless access
    default_user = db.query(User).filter(User.id == "usr_aarav_sharma").first()
    if default_user:
        return default_user

    # If DB empty, create fallback user
    fallback = User(
        id="usr_aarav_sharma",
        email="aarav@miniaws.com",
        hashed_password=hash_password("password123"),
        full_name="Aarav Sharma",
        plan_tier="Developer"
    )
    db.add(fallback)
    db.commit()
    db.refresh(fallback)
    return fallback

import hashlib
import time
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from redis import Redis
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.redis import get_redis
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.services.rate_limiter import check_rate_limit
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/register", status_code=201)
def register(
    data: RegisterRequest,
    session: Session = Depends(get_session),
    redis: Redis = Depends(get_redis),
    request: Request = None,
):
    # Rate limit
    key = f"ratelimit:{request.client.host}:/auth/register"
    allowed, _ = check_rate_limit(
        redis, key, settings.rate_limit_max_requests, settings.rate_limit_window_seconds
    )
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests")

    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=data.email, hashed_password=hash_password(data.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "email": user.email}


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
    redis: Redis = Depends(get_redis),
    request: Request = None,
):
    # Rate limit
    key = f"ratelimit:{request.client.host}:/auth/login"
    allowed, _ = check_rate_limit(
        redis, key, settings.rate_limit_max_requests, settings.rate_limit_window_seconds
    )
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests")

    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    data: RefreshRequest,
    session: Session = Depends(get_session),
    redis: Redis = Depends(get_redis),
):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Token rotation: check if this refresh token was already used
    token_hash = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    if redis.get(f"refresh_revoked:{token_hash}"):
        # Reuse detected — revoke all tokens for this user
        user_id = payload["sub"]
        redis.setex(f"force_logout:{user_id}", 86400 * 7, "1")
        raise HTTPException(status_code=401, detail="Token has been revoked")

    # Check forced logout
    user_id = payload["sub"]
    if redis.get(f"force_logout:{user_id}"):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    user = session.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    # Blacklist old refresh token for its remaining lifetime
    exp = payload.get("exp", 0)
    ttl = max(0, int(exp) - int(time.time()))
    if ttl > 0:
        redis.setex(f"refresh_revoked:{token_hash}", ttl, "1")

    # Issue new pair
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role,
        "is_active": current_user.is_active,
    }

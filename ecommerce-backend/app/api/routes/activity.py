from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from sqlmodel import Session, select, desc
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.activity import ActivityLog

router = APIRouter(prefix="/admin/activity", tags=["admin"])


class ActivityLogRead(BaseModel):
    id: int
    actor_id: int | None
    actor_email: str
    action: str
    entity_type: str
    entity_id: str | None
    details: str
    ip_address: str
    created_at: str

    class Config:
        from_attributes = True


class ActivityLogResponse(BaseModel):
    items: List[ActivityLogRead]
    total: int
    page: int
    per_page: int


@router.get("", response_model=ActivityLogResponse)
def list_activity(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    action: Optional[str] = Query(default=None, description="Filter by action"),
    entity_type: Optional[str] = Query(default=None, description="Filter by entity type"),
    actor_id: Optional[int] = Query(default=None, description="Filter by actor"),
    search: Optional[str] = Query(default=None, description="Search in details or actor_email"),
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """List activity log entries with pagination and filtering."""
    stmt = select(ActivityLog)

    if action:
        stmt = stmt.where(ActivityLog.action == action)
    if entity_type:
        stmt = stmt.where(ActivityLog.entity_type == entity_type)
    if actor_id:
        stmt = stmt.where(ActivityLog.actor_id == actor_id)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            ActivityLog.actor_email.ilike(like)
            | ActivityLog.details.ilike(like)
            | ActivityLog.entity_type.ilike(like)
        )

    # Total count
    total = len(session.exec(stmt).all())

    # Paginated
    stmt = stmt.order_by(desc(ActivityLog.created_at))
    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    items = session.exec(stmt).all()

    return ActivityLogResponse(
        items=[
            ActivityLogRead(
                id=e.id,
                actor_id=e.actor_id,
                actor_email=e.actor_email,
                action=e.action,
                entity_type=e.entity_type,
                entity_id=e.entity_id,
                details=e.details,
                ip_address=e.ip_address,
                created_at=e.created_at.isoformat() if e.created_at else "",
            )
            for e in items
        ],
        total=total,
        page=page,
        per_page=per_page,
    )

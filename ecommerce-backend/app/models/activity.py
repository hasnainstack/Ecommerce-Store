from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class ActivityLog(SQLModel, table=True):
    __tablename__ = "activity_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    actor_id: Optional[int] = Field(default=None, index=True)
    actor_email: str = ""
    action: str  # e.g. "create", "update", "delete", "login", "status_change"
    entity_type: str  # e.g. "product", "order", "settings", "user", "media", "page"
    entity_id: Optional[str] = None  # string since some entity IDs could be slugs
    details: str = ""  # JSON string with extra context
    ip_address: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

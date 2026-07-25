from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class Media(SQLModel, table=True):
    __tablename__ = "media"
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str  # UUID-based filename on disk
    original_name: str  # original uploaded filename
    mime_type: str = "image/png"
    file_size: int = 0  # bytes
    alt_text: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

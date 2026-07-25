from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class Page(SQLModel, table=True):
    __tablename__ = "pages"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    slug: str = Field(index=True, unique=True)
    content: str = ""
    meta_description: str = ""
    published: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

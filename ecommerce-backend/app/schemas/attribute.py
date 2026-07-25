from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── AttributeValue ──────────────────────────────────────

class AttributeValueRead(BaseModel):
    id: int
    attribute_id: int
    value: str
    sort_order: int
    extra_data: str

    class Config:
        from_attributes = True


class AttributeValueCreate(BaseModel):
    value: str
    sort_order: int = 0
    extra_data: str = "{}"


class AttributeValueUpdate(BaseModel):
    value: Optional[str] = None
    sort_order: Optional[int] = None
    extra_data: Optional[str] = None


# ── Attribute ───────────────────────────────────────────

class AttributeRead(BaseModel):
    id: int
    name: str
    type: str
    created_at: datetime
    values: List[AttributeValueRead] = []

    class Config:
        from_attributes = True


class AttributeCreate(BaseModel):
    name: str
    type: str = "select"
    values: List[AttributeValueCreate] = []


class AttributeUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    values: Optional[List[AttributeValueCreate]] = None  # replaces all values if provided

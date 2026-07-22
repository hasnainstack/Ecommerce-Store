from typing import Optional
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    base_price: float = Field(gt=0)
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    # All optional — this is a PATCH-style partial update schema
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = Field(default=None, gt=0)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None


class ProductRead(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    base_price: float
    is_active: bool
    category_id: Optional[int]

    class Config:
        from_attributes = True

from typing import Optional, List
from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    variant_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemRemove(BaseModel):
    variant_id: int


class CartItemRead(BaseModel):
    variant_id: int
    product_id: int
    product_name: str
    product_slug: str
    product_image_url: str = ""
    price: float
    quantity: int
    stock_qty: int
    attributes: str = "{}"


class CartRead(BaseModel):
    items: List[CartItemRead] = []
    total: float = 0.0
    item_count: int = 0

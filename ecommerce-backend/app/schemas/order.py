from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.order import OrderStatus


class OrderItemRead(BaseModel):
    id: int
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    product_name: str
    product_slug: str = ""
    product_image_url: str = ""
    variant_attributes: str = "{}"
    unit_price: float
    quantity: int
    total_price: float

    class Config:
        from_attributes = True


class OrderRead(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    shipping_address: str = ""
    created_at: datetime
    items: List[OrderItemRead] = []

    class Config:
        from_attributes = True


class OrderListRead(BaseModel):
    """Compact representation for order-history list views."""
    id: int
    status: OrderStatus
    total_amount: float
    created_at: datetime
    item_count: int = 0

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
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
    id: int
    status: OrderStatus
    total_amount: float
    created_at: datetime
    item_count: int = 0

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# --- Cart schemas ---

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


# --- Checkout schemas ---

class CheckoutRequest(BaseModel):
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    order_id: int


# --- Auth schemas ---

class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

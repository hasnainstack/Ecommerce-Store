from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(str, Enum):
    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    status: OrderStatus = Field(default=OrderStatus.pending)
    total_amount: float
    shipping_address: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    items: List["OrderItem"] = Relationship(back_populates="order")
    payments: List["Payment"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: Optional[int] = None
    variant_id: Optional[int] = None

    # Snapshot fields — immutable after creation, survive product changes
    product_name: str
    product_slug: str = ""
    product_image_url: str = ""
    variant_attributes: str = "{}"
    unit_price: float
    quantity: int
    total_price: float

    order: Optional[Order] = Relationship(back_populates="items")


class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    stripe_session_id: str = Field(index=True)
    stripe_payment_intent_id: Optional[str] = None
    amount: float
    currency: str = "usd"
    status: PaymentStatus = Field(default=PaymentStatus.pending)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    order: Optional[Order] = Relationship(back_populates="payments")

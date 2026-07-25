from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    refunded = "refunded"

    def can_transition_to(self, target: "OrderStatus") -> bool:
        return target in _ORDER_TRANSITIONS.get(self, set())


# Module-level transitions dict (avoids Python Enum treating it as a member)
_ORDER_TRANSITIONS = {
    OrderStatus.pending: {OrderStatus.confirmed, OrderStatus.cancelled},
    OrderStatus.confirmed: {OrderStatus.processing, OrderStatus.cancelled, OrderStatus.refunded},
    OrderStatus.processing: {OrderStatus.shipped, OrderStatus.cancelled, OrderStatus.refunded},
    OrderStatus.shipped: {OrderStatus.delivered, OrderStatus.cancelled, OrderStatus.refunded},
    OrderStatus.delivered: {OrderStatus.refunded},
    OrderStatus.cancelled: set(),
    OrderStatus.refunded: set(),
}


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
    tracking_number: str = ""
    tracking_carrier: str = ""
    admin_notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    items: List["OrderItem"] = Relationship(back_populates="order")
    payments: List["Payment"] = Relationship(back_populates="order")
    status_history: List["OrderStatusHistory"] = Relationship(
        back_populates="order",
        sa_relationship_kwargs={"order_by": "OrderStatusHistory.created_at"},
    )


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: Optional[int] = None
    variant_id: Optional[int] = None

    # Snapshot fields — set at purchase time, survive product changes
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


class OrderStatusHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id", index=True)
    from_status: Optional[str] = None  # None for initial creation
    to_status: str
    changed_by: str = "system"  # email or "system"
    reason: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    order: Optional[Order] = Relationship(back_populates="status_history")

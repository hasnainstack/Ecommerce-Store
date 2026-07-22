"""Order creation with atomic stock decrement."""

from decimal import Decimal
from typing import Optional
from sqlmodel import Session, select
from app.models.order import Order, OrderItem, OrderStatus, Payment, PaymentStatus
from app.models.product import ProductVariant
from app.services import cart as cart_service


def create_order_from_cart(
    session: Session,
    user_id: int,
    cart_data: dict[str, int],
) -> Order:
    """Create an Order + OrderItems from cart data.

    Validates stock, snapshots prices, and decrements inventory atomically
    using SELECT ... FOR UPDATE.
    """
    variant_ids = [int(v) for v in cart_data.keys()]
    variants = session.exec(
        select(ProductVariant)
        .where(ProductVariant.id.in_(variant_ids))
        .with_for_update()  # lock rows — no concurrent overselling
    ).all()

    variant_map = {v.id: v for v in variants}
    if len(variants) != len(variant_ids):
        raise ValueError("Some variants no longer exist")

    order_items_data = []
    total = Decimal("0.00")

    for vid_str, qty in cart_data.items():
        vid = int(vid_str)
        v = variant_map[vid]
        qty_int = int(qty)

        if v.stock_qty < qty_int:
            raise ValueError(
                f"Insufficient stock for SKU {v.sku} "
                f"(requested {qty_int}, available {v.stock_qty})"
            )

        # Decrement stock atomically
        v.stock_qty -= qty_int

        price = Decimal(str(v.price_override or v.product.base_price))
        line_total = price * qty_int
        total += line_total

        main_image = v.product.images[0].url if v.product.images else ""

        order_items_data.append({
            "product_id": v.product_id,
            "variant_id": v.id,
            "product_name": v.product.name,
            "product_slug": v.product.slug,
            "product_image_url": main_image,
            "variant_attributes": v.attributes,
            "unit_price": float(price),
            "quantity": qty_int,
            "total_price": float(line_total),
        })

    order = Order(user_id=user_id, total_amount=float(total))
    session.add(order)
    session.flush()

    for item_data in order_items_data:
        session.add(OrderItem(order_id=order.id, **item_data))

    return order


def get_order(session: Session, order_id: int) -> Optional[Order]:
    return session.get(Order, order_id)


def list_user_orders(
    session: Session, user_id: int, skip: int = 0, limit: int = 20
) -> list[Order]:
    stmt = (
        select(Order)
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return session.exec(stmt).all()


def update_order_status(
    session: Session, order_id: int, status: OrderStatus
) -> Optional[Order]:
    order = session.get(Order, order_id)
    if not order:
        return None
    order.status = status
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

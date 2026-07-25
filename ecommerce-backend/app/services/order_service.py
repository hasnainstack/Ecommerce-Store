"""Order creation with atomic stock decrement and state machine."""

from decimal import Decimal
from typing import Optional, Tuple
from sqlmodel import Session, select, func
from app.models.order import Order, OrderItem, OrderStatus, OrderStatusHistory, Payment, PaymentStatus
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

    # Log initial status
    session.add(OrderStatusHistory(
        order_id=order.id,
        from_status=None,
        to_status=OrderStatus.pending.value,
        changed_by="system",
        reason="Order created",
    ))

    return order


def get_order(session: Session, order_id: int) -> Optional[Order]:
    stmt = (
        select(Order)
        .where(Order.id == order_id)
    )
    return session.exec(stmt).first()


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


def list_all_orders(
    session: Session,
    status: Optional[OrderStatus] = None,
    search: str = "",
    skip: int = 0,
    limit: int = 20,
) -> Tuple[list[Order], int]:
    """List all orders with optional filtering — admin use only."""
    from app.models.user import User

    base_q = select(Order)
    count_q = select(func.count(Order.id))

    if status:
        base_q = base_q.where(Order.status == status)
        count_q = count_q.where(Order.status == status)

    if search:
        base_q = base_q.join(User).where(User.email.ilike(f"%{search}%"))
        count_q = count_q.join(User).where(User.email.ilike(f"%{search}%"))

    total = session.exec(count_q).one()
    orders = session.exec(
        base_q.order_by(Order.created_at.desc()).offset(skip).limit(limit)
    ).all()

    return orders, total


def transition_order_status(
    session: Session,
    order_id: int,
    new_status: OrderStatus,
    changed_by: str = "system",
    reason: str = "",
) -> Tuple[Optional[Order], Optional[str]]:
    """Transition an order to a new status with state machine validation.

    Returns (order, None) on success, (None, error_message) on failure.
    """
    order = session.get(Order, order_id)
    if not order:
        return None, "Order not found"

    current = order.status

    # If same status, no-op success
    if current == new_status:
        return order, None

    if not current.can_transition_to(new_status):
        return None, (
            f"Cannot transition order from '{current.value}' to '{new_status.value}'. "
            f"Allowed transitions: {[s.value for s in _ORDER_TRANSITIONS.get(current, set())]}"
        )

    # Apply the transition
    order.status = new_status
    session.add(order)

    # Log the history entry
    history = OrderStatusHistory(
        order_id=order.id,
        from_status=current.value,
        to_status=new_status.value,
        changed_by=changed_by,
        reason=reason,
    )
    session.add(history)

    session.commit()
    session.refresh(order)

    return order, None


def update_order_status(
    session: Session, order_id: int, status: OrderStatus
) -> Optional[Order]:
    """Legacy wrapper — kept for backward compat. Prefer transition_order_status."""
    order, err = transition_order_status(session, order_id, status)
    if err:
        raise ValueError(err)
    return order

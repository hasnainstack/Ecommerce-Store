from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.api.deps import get_current_user, require_admin
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User, UserRole
from app.schemas.order import OrderRead, OrderListRead, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=List[OrderListRead])
def list_orders(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    stmt = (
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    orders = session.exec(stmt).all()

    result = []
    for o in orders:
        count_stmt = select(func.count()).where(OrderItem.order_id == o.id)
        count = session.exec(count_stmt).one()
        result.append(OrderListRead(
            id=o.id,
            status=o.status,
            total_amount=o.total_amount,
            created_at=o.created_at,
            item_count=count,
        ))
    return result


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return order


@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    from app.services.order_service import update_order_status as ups
    order = ups(session, order_id, data.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

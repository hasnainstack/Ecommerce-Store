from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.api.deps import get_current_user, require_admin
from app.models.order import Order, OrderItem, OrderStatus, OrderStatusHistory
from app.models.user import User, UserRole
from app.schemas.order import (
    OrderRead, OrderItemRead, OrderListRead, OrderStatusUpdate,
    OrderStatusUpdateResponse, AdminOrderRead, AdminOrderListResponse, OrderStatusHistoryRead,
    OrderUpdate,
)
from app.services.audit import log_activity

router = APIRouter(prefix="/orders", tags=["orders"])

# ── User-facing endpoints ──────────────────────────────────────


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


# ── Admin endpoints ────────────────────────────────────────────


@router.get("/admin/all", response_model=AdminOrderListResponse)
def admin_list_orders(
    status: Optional[OrderStatus] = Query(default=None),
    search: str = Query(default="", description="Search by customer email"),
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    from app.services.order_service import list_all_orders

    orders, total = list_all_orders(session, status=status, search=search, skip=skip, limit=limit)

    result = []
    for o in orders:
        user = session.get(User, o.user_id)
        result.append(AdminOrderRead(
            id=o.id,
            user_id=o.user_id,
            status=o.status,
            total_amount=o.total_amount,
            shipping_address=o.shipping_address,
            created_at=o.created_at,
            items=list(o.items or []),
            status_history=list(o.status_history or []),
            customer_email=user.email if user else "",
            customer_name=user.email.split("@")[0] if user else "",
        ))
    return AdminOrderListResponse(data=result, total=total)


@router.get("/admin/{order_id}", response_model=AdminOrderRead)
def admin_get_order(
    order_id: int,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user = session.get(User, order.user_id)

    return AdminOrderRead(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        total_amount=order.total_amount,
        shipping_address=order.shipping_address,
        created_at=order.created_at,
        items=list(order.items or []),
        status_history=list(order.status_history or []),
        customer_email=user.email if user else "",
        customer_name=user.email.split("@")[0] if user else "",
    )


# Legacy endpoint — kept for backward compat
@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status_legacy(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    from app.services.order_service import transition_order_status
    order, err = transition_order_status(
        session, order_id, data.status,
        changed_by=current_user.email,
        reason=data.reason,
    )
    if not order:
        raise HTTPException(status_code=404, detail=err or "Order not found")
    if err:
        raise HTTPException(status_code=400, detail=err)
    return order


@router.patch("/admin/{order_id}/status", response_model=OrderStatusUpdateResponse)
def admin_update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
    request: Request = None,
):
    from app.services.order_service import transition_order_status

    order, err = transition_order_status(
        session,
        order_id,
        data.status,
        changed_by=current_user.email,
        reason=data.reason,
    )
    if err:
        raise HTTPException(status_code=400, detail=err)

    log_activity(
        session, actor_id=current_user.id, actor_email=current_user.email,
        action="status_change", entity_type="order", entity_id=str(order_id),
        details={"from": order.status_history[-2].from_status if len(order.status_history) > 1 else None, "to": data.status.value, "reason": data.reason},
        ip_address=request.client.host if request else "",
    )
    session.commit()

    # Get the latest history entry
    history = order.status_history[-1] if order.status_history else None

    return OrderStatusUpdateResponse(
        order=OrderRead.model_validate(order),
        history=OrderStatusHistoryRead.model_validate(history) if history else None,
    )


@router.patch("/admin/{order_id}/details", response_model=AdminOrderRead)
def update_order_details(
    order_id: int,
    data: OrderUpdate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
    request: Request = None,
):
    """Update tracking info and admin notes for an order."""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(order, field, value)

    session.add(order)
    session.commit()
    session.refresh(order)

    log_activity(
        session, actor_id=current_user.id, actor_email=current_user.email,
        action="update", entity_type="order", entity_id=str(order_id),
        details={"updated_fields": list(updates.keys())},
        ip_address=request.client.host if request else "",
    )
    session.commit()

    # Return updated order with admin fields
    from app.models.user import User
    user = session.get(User, order.user_id)
    return AdminOrderRead(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        total_amount=order.total_amount,
        shipping_address=order.shipping_address,
        created_at=order.created_at,
        items=[OrderItemRead.model_validate(i) for i in (order.items or [])],
        status_history=[OrderStatusHistoryRead.model_validate(h) for h in (order.status_history or [])],
        customer_email=user.email if user else "",
        customer_name=user.full_name or user.email.split("@")[0] if user else "",
        tracking_number=order.tracking_number,
        tracking_carrier=order.tracking_carrier,
        admin_notes=order.admin_notes,
    )

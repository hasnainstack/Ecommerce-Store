from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from redis import Redis
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.redis import get_redis
from app.api.deps import get_optional_current_user, get_guest_session_id, get_current_user
from app.models.product import ProductVariant
from app.models.user import User
from app.schemas.order import CartItemAdd, CartItemRemove, CartItemRead, CartRead
from app.services import cart as cart_service

router = APIRouter(prefix="/cart", tags=["cart"])


def _resolve_owner(
    current_user: Optional[User], session_id: Optional[str]
) -> tuple[Optional[int], Optional[str]]:
    if current_user:
        return current_user.id, None
    if session_id:
        return None, session_id
    raise HTTPException(status_code=400, detail="X-Session-ID header required for guest cart")


@router.get("/", response_model=CartRead)
def get_cart(
    current_user: Optional[User] = Depends(get_optional_current_user),
    session_id: Optional[str] = Depends(get_guest_session_id),
    redis: Redis = Depends(get_redis),
    session: Session = Depends(get_session),
):
    user_id, gid = _resolve_owner(current_user, session_id)
    raw = cart_service.get_cart(redis, user_id=user_id, session_id=gid)
    if not raw:
        return CartRead()

    variant_ids = [int(v) for v in raw.keys()]
    variants = session.exec(
        select(ProductVariant).where(ProductVariant.id.in_(variant_ids))
    ).all()

    items = []
    total = 0.0
    for v in variants:
        qty = raw[str(v.id)]
        price = v.price_override or v.product.base_price
        total += price * qty
        main_image = v.product.images[0].url if v.product.images else ""
        items.append(CartItemRead(
            variant_id=v.id,
            product_id=v.product_id,
            product_name=v.product.name,
            product_slug=v.product.slug,
            product_image_url=main_image,
            price=price,
            quantity=qty,
            stock_qty=v.stock_qty,
            attributes=v.attributes,
        ))

    return CartRead(items=items, total=round(total, 2), item_count=sum(i.quantity for i in items))


@router.post("/add", status_code=204)
def add_to_cart(
    data: CartItemAdd,
    current_user: Optional[User] = Depends(get_optional_current_user),
    session_id: Optional[str] = Depends(get_guest_session_id),
    redis: Redis = Depends(get_redis),
    session: Session = Depends(get_session),
):
    user_id, gid = _resolve_owner(current_user, session_id)
    variant = session.get(ProductVariant, data.variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    cart_service.add_item(redis, data.variant_id, data.quantity, user_id=user_id, session_id=gid)


@router.post("/remove", status_code=204)
def remove_from_cart(
    data: CartItemRemove,
    current_user: Optional[User] = Depends(get_optional_current_user),
    session_id: Optional[str] = Depends(get_guest_session_id),
    redis: Redis = Depends(get_redis),
):
    user_id, gid = _resolve_owner(current_user, session_id)
    cart_service.remove_item(redis, data.variant_id, user_id=user_id, session_id=gid)


@router.delete("/", status_code=204)
def clear_cart(
    current_user: Optional[User] = Depends(get_optional_current_user),
    session_id: Optional[str] = Depends(get_guest_session_id),
    redis: Redis = Depends(get_redis),
):
    user_id, gid = _resolve_owner(current_user, session_id)
    cart_service.clear_cart(redis, user_id=user_id, session_id=gid)


@router.post("/merge", status_code=204)
def merge_cart(
    current_user: User = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_guest_session_id),
    redis: Redis = Depends(get_redis),
):
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header required")
    cart_service.merge_cart(redis, current_user.id, session_id)

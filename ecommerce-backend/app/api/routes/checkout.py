from fastapi import APIRouter, Depends, HTTPException, Query
from redis import Redis
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.redis import get_redis
from app.api.deps import get_current_user
from app.models.user import User
from app.models.order import Payment
from app.models.product import ProductVariant
from app.schemas.order import CheckoutResponse
from app.services import cart as cart_service
from app.services.order_service import create_order_from_cart
from app.services.stripe_service import create_checkout_session

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("/", response_model=CheckoutResponse)
def checkout(
    success_url: str = Query(default="http://localhost:3000/cart?success=1"),
    cancel_url: str = Query(default="http://localhost:3000/cart?cancelled=1"),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis),
    session: Session = Depends(get_session),
):
    # 1. Get cart
    raw_cart = cart_service.get_cart(redis, user_id=current_user.id)
    if not raw_cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Build line items for Stripe
    variant_ids = [int(v) for v in raw_cart.keys()]
    variants = session.exec(
        select(ProductVariant).where(ProductVariant.id.in_(variant_ids))
    ).all()

    line_items = []
    for v in variants:
        qty = raw_cart[str(v.id)]
        price = v.price_override or v.product.base_price
        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {"name": v.product.name},
                "unit_amount": int(price * 100),
            },
            "quantity": qty,
        })

    # 3. Create order (validates stock, decrements atomically)
    order = create_order_from_cart(session, current_user.id, raw_cart)

    # 4. Create Stripe Checkout Session
    stripe_result = create_checkout_session(
        line_items=line_items,
        order_id=order.id,
        customer_email=current_user.email,
        success_url=success_url,
        cancel_url=cancel_url,
    )

    # 5. Record payment
    session.add(Payment(
        order_id=order.id,
        stripe_session_id=stripe_result["session_id"],
        amount=order.total_amount,
    ))

    session.commit()

    # 6. Clear cart — only after DB commit succeeds
    cart_service.clear_cart(redis, user_id=current_user.id)

    return CheckoutResponse(checkout_url=stripe_result["url"], order_id=order.id)

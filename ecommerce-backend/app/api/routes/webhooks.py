import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from redis import Redis
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.redis import get_redis
from app.models.order import Order, OrderItem, Payment, OrderStatus, PaymentStatus
from app.models.product import ProductVariant
from app.services.stripe_service import verify_webhook_signature

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _handle_checkout_completed(event: dict, session: Session, redis: Redis) -> None:
    stripe_session = event["data"]["object"]
    session_id = stripe_session["id"]
    payment_intent = stripe_session.get("payment_intent")
    payment_status = stripe_session.get("payment_status", "")

    if payment_status != "paid":
        return

    payment = session.exec(
        select(Payment).where(Payment.stripe_session_id == session_id)
    ).first()
    if not payment:
        return

    order = session.get(Order, payment.order_id)
    if not order:
        return

    # Update payment status
    payment.status = PaymentStatus.succeeded
    payment.stripe_payment_intent_id = payment_intent
    session.add(payment)

    # Transition order via state machine
    from app.services.order_service import transition_order_status
    order, err = transition_order_status(
        session, order.id, OrderStatus.paid,
        changed_by="stripe",
        reason="Payment completed via Stripe",
    )
    if err:
        # Order might not be in a state to transition (e.g. already confirmed by admin)
        # Just save the payment update
        session.commit()


def _handle_checkout_expired(event: dict, session: Session, redis: Redis) -> None:
    stripe_session = event["data"]["object"]
    session_id = stripe_session["id"]
    payment = session.exec(
        select(Payment).where(Payment.stripe_session_id == session_id)
    ).first()
    if not payment:
        return
    order = session.get(Order, payment.order_id)
    if order:
        payment.status = PaymentStatus.failed
        session.add(payment)

        from app.services.order_service import transition_order_status
        order, err = transition_order_status(
            session, order.id, OrderStatus.cancelled,
            changed_by="stripe",
            reason="Checkout session expired",
        )
        if err:
            session.commit()


def _handle_charge_refunded(event: dict, session: Session, redis: Redis) -> None:
    payment_intent = event["data"]["object"].get("id", "")
    payment = session.exec(
        select(Payment).where(Payment.stripe_payment_intent_id == payment_intent)
    ).first()
    if payment:
        payment.status = PaymentStatus.refunded
        session.add(payment)

        if payment.order_id:
            from app.services.order_service import transition_order_status
            order, err = transition_order_status(
                session, payment.order_id, OrderStatus.refunded,
                changed_by="stripe",
                reason="Charge refunded via Stripe",
            )
            if err:
                session.commit()
        else:
            session.commit()


HANDLERS = {
    "checkout.session.completed": _handle_checkout_completed,
    "checkout.session.expired": _handle_checkout_expired,
    "charge.refunded": _handle_charge_refunded,
}


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    session: Session = Depends(get_session),
    redis: Redis = Depends(get_redis),
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        event = verify_webhook_signature(payload, sig_header)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Idempotency — skip if already processed
    event_id = event.get("id", "")
    if redis.get(f"stripe_event:{event_id}"):
        return {"status": "already_processed"}
    redis.setex(f"stripe_event:{event_id}", 86400, "1")

    handler = HANDLERS.get(event.get("type", ""))
    if handler:
        handler(event, session, redis)

    return {"status": "ok"}

"""Stripe Checkout integration."""

import stripe
from stripe import StripeError
from app.core.config import settings

stripe.api_key = settings.stripe_secret_key


def create_checkout_session(
    *,
    line_items: list[dict],
    order_id: int,
    customer_email: str | None,
    success_url: str,
    cancel_url: str,
) -> dict:
    """Create a Stripe Checkout Session. Returns {session_id, url}."""
    session = stripe.checkout.Session.create(
        customer_email=customer_email,
        line_items=line_items,
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": str(order_id)},
        payment_intent_data={"metadata": {"order_id": str(order_id)}},
    )
    return {"session_id": session.id, "url": session.url}


def verify_webhook_signature(payload: bytes, sig_header: str) -> dict:
    """Verify Stripe webhook signature and return the parsed event."""
    return stripe.Webhook.construct_event(
        payload, sig_header, settings.stripe_webhook_secret
    )

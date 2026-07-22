"""Redis-backed shopping cart.

Carts are stored as Redis hashes:
  cart:user:{user_id}    — authenticated user cart
  cart:guest:{session_id} — guest cart

Each hash field maps variant_id (str) -> quantity (int).
"""

from typing import Optional
from redis import Redis

CART_PREFIX = "cart"


def _key(user_id: Optional[int], session_id: Optional[str]) -> str:
    if user_id:
        return f"{CART_PREFIX}:user:{user_id}"
    if session_id:
        return f"{CART_PREFIX}:guest:{session_id}"
    raise ValueError("Either user_id or session_id is required")


def get_cart(
    redis: Redis, user_id: Optional[int] = None, session_id: Optional[str] = None
) -> dict[str, int]:
    raw = redis.hgetall(_key(user_id, session_id))
    return {k: int(v) for k, v in raw.items()} if raw else {}


def add_item(
    redis: Redis,
    variant_id: int,
    quantity: int = 1,
    user_id: Optional[int] = None,
    session_id: Optional[str] = None,
) -> None:
    key = _key(user_id, session_id)
    redis.hincrby(key, str(variant_id), quantity)
    if not user_id:
        redis.expire(key, 86400 * 7)  # 7-day TTL for guest carts


def set_item(
    redis: Redis,
    variant_id: int,
    quantity: int,
    user_id: Optional[int] = None,
    session_id: Optional[str] = None,
) -> None:
    """Set exact quantity (0 removes the item)."""
    key = _key(user_id, session_id)
    if quantity <= 0:
        redis.hdel(key, str(variant_id))
    else:
        redis.hset(key, str(variant_id), quantity)
    if not user_id:
        redis.expire(key, 86400 * 7)


def remove_item(
    redis: Redis,
    variant_id: int,
    user_id: Optional[int] = None,
    session_id: Optional[str] = None,
) -> None:
    redis.hdel(_key(user_id, session_id), str(variant_id))


def clear_cart(
    redis: Redis,
    user_id: Optional[int] = None,
    session_id: Optional[str] = None,
) -> None:
    redis.delete(_key(user_id, session_id))


def merge_cart(redis: Redis, user_id: int, session_id: str) -> None:
    """Merge guest cart into user cart (additive)."""
    guest_key = _key(None, session_id)
    user_key = _key(user_id, None)
    guest_items = redis.hgetall(guest_key)
    if not guest_items:
        return
    pipe = redis.pipeline()
    for vid, qty in guest_items.items():
        pipe.hincrby(user_key, vid, int(qty))
    pipe.delete(guest_key)
    pipe.execute()

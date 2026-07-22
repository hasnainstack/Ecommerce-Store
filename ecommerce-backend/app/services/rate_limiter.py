"""Sliding-window rate limiter using Redis sorted sets."""

import time
from redis import Redis


def check_rate_limit(
    redis: Redis,
    key: str,
    max_requests: int,
    window_seconds: int,
) -> tuple[bool, int]:
    """Returns (is_allowed, remaining_requests)."""
    now = time.time()
    cutoff = now - window_seconds

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, cutoff)  # prune stale entries
    pipe.zcard(key)                         # count current window
    pipe.zadd(key, {str(now): now})         # add this request
    pipe.expire(key, window_seconds)        # auto-cleanup TTL
    _, count, _, _ = pipe.execute()

    allowed = count <= max_requests
    remaining = max(0, max_requests - count)
    return allowed, remaining

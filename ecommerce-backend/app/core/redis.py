"""Redis client — falls back to fakeredis (in-memory) when Redis is unavailable."""

from redis import Redis
from app.core.config import settings

try:
    redis_client = Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=1)
    redis_client.ping()
except Exception:
    import fakeredis
    redis_client = fakeredis.FakeStrictRedis(decode_responses=True)


def get_redis() -> Redis:
    return redis_client

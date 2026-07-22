from redis import Redis
from app.core.config import settings

# Single global Redis client — thread-safe, manages its own connection pool
redis_client = Redis.from_url(settings.redis_url, decode_responses=True)


def get_redis() -> Redis:
    return redis_client

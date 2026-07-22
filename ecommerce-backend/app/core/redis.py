from redis import Redis
from app.core.config import settings

# Single global client — Redis.from_url manages its own connection pool (thread-safe)
redis_client = Redis.from_url(settings.redis_url, decode_responses=True)


def get_redis() -> Redis:
    return redis_client

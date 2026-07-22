from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database — Supabase Postgres connection string
    # Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
    database_url: str

    # Redis — for cart sessions, rate limiting, cache
    redis_url: str

    # Auth
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Rate limiting
    rate_limit_max_requests: int = 5
    rate_limit_window_seconds: int = 300

    # Cart
    guest_cart_ttl_days: int = 7

    # Frontend URL (for Stripe redirects, CORS)
    frontend_url: str = "http://localhost:3000"

    # Supabase-specific connection pool settings
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_recycle: int = 300  # recycle connections every 5 min (Supabase idle timeout is 15 min)

    class Config:
        env_file = ".env"


settings = Settings()

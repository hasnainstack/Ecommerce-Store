from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

# Supabase-friendly connection pool:
# - pool_pre_ping verifies connections before use (handles Supabase's idle timeout)
# - pool_recycle ensures connections cycle before Supabase's 15-min idle disconnect
engine = create_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_recycle=settings.db_pool_recycle,
)


def init_db() -> None:
    """Create tables and extensions. In production, use Alembic migrations."""
    from sqlmodel import text
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

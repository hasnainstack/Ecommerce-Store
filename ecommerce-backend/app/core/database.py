from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

# pool_pre_ping avoids "server closed the connection" errors on idle connections
engine = create_engine(settings.database_url, echo=False, pool_pre_ping=True)


def init_db() -> None:
    """Create tables and extensions. In production, use Alembic migrations instead of this."""
    from sqlmodel import text
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency — yields a DB session per request, closes it after."""
    with Session(engine) as session:
        yield session

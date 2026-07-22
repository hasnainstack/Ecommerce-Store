from fastapi import FastAPI
from app.core.database import init_db
from app.api.routes import products, auth

app = FastAPI(title="Store API", version="0.1.0")

app.include_router(auth.router)
app.include_router(products.router)


@app.on_event("startup")
def on_startup():
    # Dev convenience only — use Alembic migrations in real production deploys
    init_db()


@app.get("/health")
def health_check():
    return {"status": "ok"}

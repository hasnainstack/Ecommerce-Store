from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import products, auth, cart, orders, checkout, webhooks, categories

app = FastAPI(title="Store API", version="0.2.0")

# Serve uploaded files (images, etc.) — must be registered before routes so it doesn't shadow them
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# CORS — allow the frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(checkout.router)
app.include_router(webhooks.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health_check():
    return {"status": "ok"}

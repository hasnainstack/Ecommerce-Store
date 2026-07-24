"""
Seed script — populates the database with sample categories, products, variants, and images.

Usage:
  cd ecommerce-backend && python -m app.seed

This script copies placeholder images from the frontend public directory to the
backend uploads directory, so products display immediately.
"""

import sys
import shutil
from pathlib import Path

# Ensure we can import from the app package
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlmodel import Session, select
from app.core.database import engine, init_db
from app.models.product import Category, Product, ProductVariant, ProductImage


# ── Source of placeholder images ──────────────────────────────────
FRONTEND_IMAGES_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "frontend"
    / "public"
    / "images"
    / "products"
)

# Maps product names → frontend image filename
PLACEHOLDER_MAP: dict[str, str] = {
    "Wireless Headphones Pro": "headphones.svg",
    "Premium Cotton T-Shirt": "tshirt.svg",
    "Running Shoes Ultra": "shoes.svg",
    "Smart Watch Series 5": "watch.svg",
    "Denim Jacket Classic": "fashion.svg",
    "Yoga Mat Premium": "sports.svg",
    "Leather Wallet": "fashion.svg",
    "Bluetooth Speaker": "headphones.svg",
    "Silk Face Mask": "beauty.svg",
    "Ergonomic Office Chair": "furniture.svg",
    "Dumbbell Set 20kg": "sports.svg",
    "Moisturizer Cream": "beauty.svg",
}

PRODUCTS = [
    {
        "name": "Wireless Headphones Pro",
        "slug": "wireless-headphones-pro",
        "description": "Premium noise-cancelling wireless headphones with 40-hour battery life. Features active noise cancellation, comfortable memory foam ear cushions, and crystal-clear audio.",
        "base_price": 249.99,
        "category": "Electronics",
    },
    {
        "name": "Premium Cotton T-Shirt",
        "slug": "premium-cotton-tshirt",
        "description": "Soft, breathable 100% organic cotton t-shirt. Pre-shrunk fabric with a classic fit and reinforced stitching for long-lasting wear.",
        "base_price": 29.99,
        "category": "Fashion",
    },
    {
        "name": "Running Shoes Ultra",
        "slug": "running-shoes-ultra",
        "description": "Lightweight running shoes with responsive cushioning and breathable mesh upper. Designed for both casual joggers and serious runners.",
        "base_price": 129.99,
        "category": "Shoes",
    },
    {
        "name": "Smart Watch Series 5",
        "slug": "smart-watch-series-5",
        "description": "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Water-resistant and compatible with iOS and Android.",
        "base_price": 349.99,
        "category": "Electronics",
    },
    {
        "name": "Denim Jacket Classic",
        "slug": "denim-jacket-classic",
        "description": "Timeless denim jacket made from premium selvedge denim. Features classic button closure, chest pockets, and adjustable waist tabs.",
        "base_price": 89.99,
        "category": "Fashion",
    },
    {
        "name": "Yoga Mat Premium",
        "slug": "yoga-mat-premium",
        "description": "Eco-friendly non-slip yoga mat with extra thickness for joint protection. Includes carrying strap and alignment guide.",
        "base_price": 49.99,
        "category": "Sports",
    },
    {
        "name": "Leather Wallet",
        "slug": "leather-wallet",
        "description": "Genuine full-grain leather wallet with RFID blocking technology. Multiple card slots and a clear ID window.",
        "base_price": 39.99,
        "category": "Fashion",
    },
    {
        "name": "Bluetooth Speaker",
        "slug": "bluetooth-speaker",
        "description": "Portable waterproof Bluetooth speaker with 360-degree sound. 12-hour battery and built-in microphone.",
        "base_price": 79.99,
        "category": "Electronics",
    },
    {
        "name": "Silk Face Mask",
        "slug": "silk-face-mask",
        "description": "Luxurious mulberry silk face mask with adjustable ear loops and filter pocket. Available in multiple colors.",
        "base_price": 14.99,
        "category": "Beauty",
    },
    {
        "name": "Ergonomic Office Chair",
        "slug": "ergonomic-office-chair",
        "description": "Fully adjustable ergonomic office chair with lumbar support. Breathable mesh back, adjustable armrests, and smooth-rolling casters.",
        "base_price": 299.99,
        "category": "Furniture",
    },
    {
        "name": "Dumbbell Set 20kg",
        "slug": "dumbbell-set-20kg",
        "description": "Complete 20kg adjustable dumbbell set with vinyl-coated weights and ergonomic handles. Perfect for home gym workouts.",
        "base_price": 89.99,
        "category": "Sports",
    },
    {
        "name": "Moisturizer Cream",
        "slug": "moisturizer-cream",
        "description": "Rich hydrating face cream with hyaluronic acid and vitamin E. Suitable for all skin types, fragrance-free and dermatologist tested.",
        "base_price": 24.99,
        "category": "Beauty",
    },
]

CATEGORIES = [
    "Electronics",
    "Fashion",
    "Shoes",
    "Beauty",
    "Sports",
    "Furniture",
]

# Fallback image for products that don't map to a specific SVG
FALLBACK_IMAGE = "product.svg"


def _slugify(name: str) -> str:
    return name.lower().replace(" ", "-")


def _copy_placeholder(backend_uploads: Path, product_name: str) -> str | None:
    """Copy the matching frontend SVG to the backend uploads dir, return its URL path."""
    filename = PLACEHOLDER_MAP.get(product_name)
    if not filename:
        filename = FALLBACK_IMAGE
    src = FRONTEND_IMAGES_DIR / filename
    if not src.exists():
        # Try fallback
        src = FRONTEND_IMAGES_DIR / FALLBACK_IMAGE
        if not src.exists():
            return None

    dest = backend_uploads / src.name
    shutil.copy2(src, dest)
    return f"/uploads/{src.name}"


def seed():
    init_db()
    backend_uploads = Path(__file__).resolve().parent.parent / "uploads"
    backend_uploads.mkdir(exist_ok=True)

    with Session(engine) as session:
        # ── Check if already seeded ──────────────────────────────────
        existing = session.exec(select(Product).limit(1)).first()
        if existing:
            print("Database already has products — skipping seed.")
            print("Run with --force to re-seed: python -m app.seed --force")
            return

        # ── Categories ────────────────────────────────────────────────
        cat_objs: dict[str, Category] = {}
        for name in CATEGORIES:
            cat = Category(name=name, slug=_slugify(name))
            session.add(cat)
            session.flush()
            cat_objs[name] = cat

        # ── Products + Variants + Images ──────────────────────────────
        for pdata in PRODUCTS:
            category_name = pdata.pop("category")
            p = Product(
                **pdata,
                category_id=cat_objs[category_name].id,
            )
            session.add(p)
            session.flush()

            # Variant
            variant = ProductVariant(
                product_id=p.id,
                sku=f"SKU-{pdata['slug'].upper().replace('-', '_')}",
                price_override=None,
                stock_qty=50,
                attributes='{"size": "Standard", "color": "Default"}',
            )
            session.add(variant)
            session.flush()

            # Image (copy from frontend placeholders)
            image_url = _copy_placeholder(backend_uploads, pdata["name"])
            if image_url:
                img = ProductImage(product_id=p.id, url=image_url, position=0)
                session.add(img)

            # If the product doesn't have a specific image, try the generic one
            elif FRONTEND_IMAGES_DIR.exists():
                for f in FRONTEND_IMAGES_DIR.glob("*.svg"):
                    dest = backend_uploads / f.name
                    shutil.copy2(f, dest)
                    img = ProductImage(product_id=p.id, url=f"/uploads/{f.name}", position=0)
                    session.add(img)
                    break

        session.commit()
        print(f"✅ Seeded {len(CATEGORIES)} categories and {len(PRODUCTS)} products with images!")


if __name__ == "__main__":
    if "--force" in sys.argv:
        # Clears existing data first
        from sqlmodel import SQLModel
        SQLModel.metadata.drop_all(engine)
        print("🗑️  Dropped all tables (--force). Recreating...")
    seed()
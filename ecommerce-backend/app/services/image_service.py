import os
import uuid
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import UploadFile
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from app.models.product import ProductImage, Product

# Uploads directory — relative to the backend root
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _validate_image(file: UploadFile) -> None:
    """Validate file type and size. Raises ValueError on failure."""
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError(
            f"Unsupported file type '{file.content_type}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_TYPES))}"
        )
    # Read first chunk to check size
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_FILE_SIZE:
        raise ValueError(f"File too large ({size} bytes). Max: {MAX_FILE_SIZE} bytes.")


def _save_file(file: UploadFile) -> str:
    """Save an uploaded file to disk and return its URL path."""
    ext = file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "png"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"/uploads/{filename}"


def add_images(
    session: Session,
    product_id: int,
    files: List[UploadFile],
    positions: Optional[List[int]] = None,
) -> List[ProductImage]:
    """Upload and attach images to a product."""
    product = session.get(Product, product_id)
    if not product:
        raise ValueError("Product not found")

    if not files:
        raise ValueError("No files provided")

    # Get next available position
    stmt = select(ProductImage).where(
        ProductImage.product_id == product_id
    ).order_by(ProductImage.position.desc())
    existing = session.exec(stmt).first()
    next_pos = (existing.position + 1) if existing else 0

    created: List[ProductImage] = []
    for i, file in enumerate(files):
        _validate_image(file)
        url = _save_file(file)
        position = positions[i] if positions and i < len(positions) else next_pos + i
        img = ProductImage(product_id=product_id, url=url, position=position)
        session.add(img)
        created.append(img)

    session.commit()
    for img in created:
        session.refresh(img)
    return created


def remove_image(session: Session, image_id: int) -> bool:
    """Delete a product image from disk and database."""
    img = session.get(ProductImage, image_id)
    if not img:
        return False

    # Delete file from disk
    filename = img.url.rsplit("/", 1)[-1]
    filepath = UPLOAD_DIR / filename
    if filepath.exists():
        filepath.unlink()

    session.delete(img)
    session.commit()
    return True


def get_images(session: Session, product_id: int) -> List[ProductImage]:
    """Get all images for a product, ordered by position."""
    stmt = (
        select(ProductImage)
        .where(ProductImage.product_id == product_id)
        .order_by(ProductImage.position)
    )
    return session.exec(stmt).all()
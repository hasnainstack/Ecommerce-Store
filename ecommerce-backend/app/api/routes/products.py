from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlmodel import Session
from app.core.database import get_session
from app.api.deps import require_admin
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead, SearchResults, ImageRead
from app.crud import product as product_crud
from app.services.search import search_products
from app.services.image_service import add_images, remove_image as delete_image_svc

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[ProductRead])
def list_products(skip: int = 0, limit: int = 50, session: Session = Depends(get_session)):
    return product_crud.list_products(session, skip=skip, limit=limit)


@router.get("/search", response_model=SearchResults)
def search(
    q: str = Query(default=""),
    category_id: Optional[int] = Query(default=None),
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    products, total = search_products(
        session, query=q, category_id=category_id, skip=skip, limit=limit,
    )
    return SearchResults(items=products, total=total)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = product_crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductRead, status_code=201)
def create_product(
    data: ProductCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    return product_crud.create_product(session, data)


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    data: ProductUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    product = product_crud.update_product(session, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    ok = product_crud.soft_delete_product(session, product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")


# ─── Image endpoints ────────────────────────────────────────────


@router.post("/{product_id}/images", response_model=List[ImageRead], status_code=201)
def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Upload one or more images for a product."""
    try:
        images = add_images(session, product_id, files)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return images


@router.delete("/{product_id}/images/{image_id}", status_code=204)
def delete_product_image(
    product_id: int,
    image_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Delete a single product image."""
    ok = delete_image_svc(session, image_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Image not found")

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from app.api.deps import require_admin
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead
from app.crud import product as product_crud

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[ProductRead])
def list_products(skip: int = 0, limit: int = 50, session: Session = Depends(get_session)):
    # Public — anyone can browse the catalog
    return product_crud.list_products(session, skip=skip, limit=limit)


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
    _admin=Depends(require_admin),  # admin-only — this is the write path
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
    # Soft delete — sets is_active=False, never removes the row
    ok = product_crud.soft_delete_product(session, product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")

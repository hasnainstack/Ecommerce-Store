from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.product import Category, CategoryAttribute
from app.schemas.category import (
    CategoryRead, CategoryWithAttributesRead,
    CategoryCreate, CategoryUpdate,
    CategoryAttributeRead, MapAttributeRequest,
)

router = APIRouter(prefix="/admin/categories", tags=["admin"])


@router.get("", response_model=List[CategoryRead])
def list_categories(
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    cats = session.exec(
        select(Category).order_by(Category.name)
    ).all()
    return cats


@router.post("", response_model=CategoryRead, status_code=201)
def create_category(
    data: CategoryCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    existing = session.exec(
        select(Category).where(Category.slug == data.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    cat = Category(**data.model_dump())
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


@router.get("/{cat_id}", response_model=CategoryWithAttributesRead)
def get_category(
    cat_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    cat = session.exec(
        select(Category).where(Category.id == cat_id)
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.patch("/{cat_id}", response_model=CategoryRead)
def update_category(
    cat_id: int,
    data: CategoryUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(cat, field, value)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


@router.delete("/{cat_id}", status_code=204)
def delete_category(
    cat_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    try:
        session.delete(cat)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category: it still has products assigned. Remove or reassign them first.",
        )


# ── Attribute Mapping ───────────────────────────────────


@router.get("/{cat_id}/attributes", response_model=List[CategoryAttributeRead])
def list_category_attributes(
    cat_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return list(cat.attributes or [])


@router.post("/{cat_id}/attributes", response_model=CategoryAttributeRead, status_code=201)
def map_attribute_to_category(
    cat_id: int,
    data: MapAttributeRequest,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Map an attribute to a category."""
    cat = session.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    from app.models.attribute import Attribute
    attr = session.get(Attribute, data.attribute_id)
    if not attr:
        raise HTTPException(status_code=404, detail="Attribute not found")

    # Check duplicate
    existing = session.exec(
        select(CategoryAttribute).where(
            CategoryAttribute.category_id == cat_id,
            CategoryAttribute.attribute_id == data.attribute_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Attribute already mapped to this category")

    mapping = CategoryAttribute(category_id=cat_id, attribute_id=data.attribute_id)
    session.add(mapping)
    session.commit()
    session.refresh(mapping)
    return mapping


@router.delete("/{cat_id}/attributes/{attr_id}", status_code=204)
def unmap_attribute_from_category(
    cat_id: int,
    attr_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    mapping = session.exec(
        select(CategoryAttribute).where(
            CategoryAttribute.category_id == cat_id,
            CategoryAttribute.attribute_id == attr_id,
        )
    ).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    session.delete(mapping)
    session.commit()

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.schemas.product import CategoryRead
from app.schemas.category import CategoryAttributesResponse, AttributeBrief, AttributeValueBrief
from app.models.product import Category, CategoryAttribute
from app.models.attribute import Attribute, AttributeValue

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryRead])
def list_categories(session: Session = Depends(get_session)):
    """List all available categories."""
    stmt = select(Category).order_by(Category.name)
    return session.exec(stmt).all()


@router.get("/{category_id}/attributes", response_model=CategoryAttributesResponse)
def get_category_attributes(
    category_id: int,
    session: Session = Depends(get_session),
):
    """Get all attributes (with their values) mapped to a category.
    Used by the product form to render dynamic attribute inputs."""
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    mappings = session.exec(
        select(CategoryAttribute)
        .where(CategoryAttribute.category_id == category_id)
    ).all()

    attrs = []
    for m in mappings:
        attr = session.get(Attribute, m.attribute_id)
        if not attr:
            continue
        values = session.exec(
            select(AttributeValue)
            .where(AttributeValue.attribute_id == attr.id)
            .order_by(AttributeValue.sort_order)
        ).all()
        attrs.append(AttributeBrief(
            id=attr.id,
            name=attr.name,
            type=attr.type,
            values=[
                AttributeValueBrief(
                    id=v.id,
                    value=v.value,
                    sort_order=v.sort_order,
                    extra_data=v.extra_data,
                )
                for v in values
            ],
        ))

    return CategoryAttributesResponse(category_id=category_id, attributes=attrs)
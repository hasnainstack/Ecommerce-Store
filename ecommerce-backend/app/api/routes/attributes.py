from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.attribute import Attribute, AttributeValue
from app.schemas.attribute import (
    AttributeRead, AttributeCreate, AttributeUpdate,
    AttributeValueCreate, AttributeValueRead, AttributeValueUpdate,
)

router = APIRouter(prefix="/admin/attributes", tags=["admin"])


def _load_with_values(session: Session, attr_id: int) -> Attribute | None:
    return session.exec(
        select(Attribute).where(Attribute.id == attr_id)
    ).first()


@router.get("", response_model=List[AttributeRead])
def list_attributes(
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    attrs = session.exec(
        select(Attribute).order_by(Attribute.name)
    ).all()
    return attrs


@router.post("", response_model=AttributeRead, status_code=201)
def create_attribute(
    data: AttributeCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    existing = session.exec(
        select(Attribute).where(Attribute.name == data.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Attribute '{data.name}' already exists")

    attr = Attribute(name=data.name, type=data.type)
    session.add(attr)
    session.flush()

    for v in data.values:
        session.add(AttributeValue(
            attribute_id=attr.id,
            value=v.value,
            sort_order=v.sort_order,
            extra_data=v.extra_data,
        ))

    session.commit()
    session.refresh(attr)
    return attr


@router.get("/{attr_id}", response_model=AttributeRead)
def get_attribute(
    attr_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    attr = _load_with_values(session, attr_id)
    if not attr:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return attr


@router.patch("/{attr_id}", response_model=AttributeRead)
def update_attribute(
    attr_id: int,
    data: AttributeUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    attr = _load_with_values(session, attr_id)
    if not attr:
        raise HTTPException(status_code=404, detail="Attribute not found")

    if data.name is not None:
        attr.name = data.name
    if data.type is not None:
        attr.type = data.type

    # Replace all values if provided
    if data.values is not None:
        for old_v in attr.values:
            session.delete(old_v)
        session.flush()
        for v in data.values:
            session.add(AttributeValue(
                attribute_id=attr.id,
                value=v.value,
                sort_order=v.sort_order,
                extra_data=v.extra_data,
            ))

    session.add(attr)
    session.commit()
    session.refresh(attr)
    return attr


@router.delete("/{attr_id}", status_code=204)
def delete_attribute(
    attr_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    attr = _load_with_values(session, attr_id)
    if not attr:
        raise HTTPException(status_code=404, detail="Attribute not found")
    session.delete(attr)
    session.commit()


# ── Attribute Values ────────────────────────────────────


@router.post("/{attr_id}/values", response_model=AttributeValueRead, status_code=201)
def add_attribute_value(
    attr_id: int,
    data: AttributeValueCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    attr = session.get(Attribute, attr_id)
    if not attr:
        raise HTTPException(status_code=404, detail="Attribute not found")
    val = AttributeValue(attribute_id=attr_id, **data.model_dump())
    session.add(val)
    session.commit()
    session.refresh(val)
    return val


@router.patch("/values/{value_id}", response_model=AttributeValueRead)
def update_attribute_value(
    value_id: int,
    data: AttributeValueUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    val = session.get(AttributeValue, value_id)
    if not val:
        raise HTTPException(status_code=404, detail="Value not found")
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(val, field, value)
    session.add(val)
    session.commit()
    session.refresh(val)
    return val


@router.delete("/values/{value_id}", status_code=204)
def delete_attribute_value(
    value_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    val = session.get(AttributeValue, value_id)
    if not val:
        raise HTTPException(status_code=404, detail="Value not found")
    session.delete(val)
    session.commit()

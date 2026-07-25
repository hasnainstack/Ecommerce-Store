import itertools
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.product import Product, ProductVariant, CategoryAttribute
from app.models.attribute import Attribute, AttributeValue
from app.schemas.variant import VariantRead, GenerateVariantsRequest, VariantUpdate

router = APIRouter(prefix="/admin/products/{product_id}/variants", tags=["admin"])


def _get_product_or_404(session: Session, product_id: int) -> Product:
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("", response_model=List[VariantRead])
def list_variants(
    product_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    product = _get_product_or_404(session, product_id)
    return list(product.variants or [])


@router.post("/generate", response_model=List[VariantRead], status_code=201)
def generate_variants(
    product_id: int,
    data: GenerateVariantsRequest,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Generate variant combinations from selected attribute values.

    Creates a variant for every combination of the selected attribute values
    (Cartesian product). Deletes any existing variants first so this is
    a full re-generation.
    """
    from app.models.attribute import AttributeValue as AV

    product = _get_product_or_404(session, product_id)

    # Resolve selections into (attribute_name, value_text) pairs per value
    # so we can build the JSON attributes object
    selections: list[list[dict]] = []
    for sel in data.selections:
        values = session.exec(
            select(AV).where(AV.id.in_(sel.value_ids))
        ).all()
        if not values:
            continue
        attr = session.get(Attribute, sel.attribute_id)
        if not attr:
            continue
        selections.append([
            {"attr": attr.name, "attr_id": attr.id, "value": v.value, "value_id": v.id}
            for v in sorted(values, key=lambda x: x.sort_order)
        ])

    if not selections:
        raise HTTPException(status_code=400, detail="No valid selections provided")

    # Remove existing variants
    for v in product.variants:
        session.delete(v)
    session.flush()

    # Generate all combinations
    base_sku = f"SKU-{product.slug.upper()}"
    created = []
    for i, combo in enumerate(itertools.product(*selections)):
        attrs_dict = {c["attr"]: c["value"] for c in combo}
        variant_sku = f"{base_sku}-{i + 1}"

        variant = ProductVariant(
            product_id=product.id,
            sku=variant_sku,
            stock_qty=0,
            attributes=str(attrs_dict),
        )
        session.add(variant)
        session.flush()
        created.append(variant)

    session.commit()
    for v in created:
        session.refresh(v)
    return created


@router.patch("/{variant_id}", response_model=VariantRead)
def update_variant(
    product_id: int,
    variant_id: int,
    data: VariantUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    _get_product_or_404(session, product_id)
    variant = session.get(ProductVariant, variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(status_code=404, detail="Variant not found")

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(variant, field, value)

    session.add(variant)
    session.commit()
    session.refresh(variant)
    return variant


@router.delete("/{variant_id}", status_code=204)
def delete_variant(
    product_id: int,
    variant_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    _get_product_or_404(session, product_id)
    variant = session.get(ProductVariant, variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(status_code=404, detail="Variant not found")
    session.delete(variant)
    session.commit()

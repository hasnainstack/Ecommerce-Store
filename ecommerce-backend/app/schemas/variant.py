from typing import Optional, List
from pydantic import BaseModel


class VariantRead(BaseModel):
    id: int
    product_id: int
    sku: str
    price_override: Optional[float] = None
    stock_qty: int
    attributes: str  # JSON string

    class Config:
        from_attributes = True


class AttributeSelection(BaseModel):
    """One attribute's selected values, e.g. Size → [S, M, L]"""
    attribute_id: int
    value_ids: List[int]


class GenerateVariantsRequest(BaseModel):
    """Attribute value ID combinations to generate variants from."""
    selections: List[AttributeSelection]


class VariantUpdate(BaseModel):
    sku: Optional[str] = None
    price_override: Optional[float] = None
    stock_qty: Optional[int] = None

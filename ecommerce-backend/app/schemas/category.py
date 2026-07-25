from typing import Optional, List
from pydantic import BaseModel


# ── Category ────────────────────────────────────────────

class CategoryRead(BaseModel):
    id: int
    name: str
    slug: str
    description: str = ""
    image_url: str = ""

    class Config:
        from_attributes = True


class CategoryWithAttributesRead(CategoryRead):
    """Category including its mapped attributes with their values."""
    attributes: List["CategoryAttributeRead"] = []


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    image_url: str = ""


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


# ── Category ↔ Attribute mapping ────────────────────────

class CategoryAttributeRead(BaseModel):
    id: int
    category_id: int
    attribute_id: int
    attribute: Optional["AttributeBrief"] = None

    class Config:
        from_attributes = True


class AttributeBrief(BaseModel):
    id: int
    name: str
    type: str
    values: list["AttributeValueBrief"] = []

    class Config:
        from_attributes = True


class AttributeValueBrief(BaseModel):
    id: int
    value: str
    sort_order: int
    extra_data: str

    class Config:
        from_attributes = True


class CategoryAttributesResponse(BaseModel):
    """Attributes + values for a category — used by the product form."""
    category_id: int
    attributes: List[AttributeBrief] = []


class MapAttributeRequest(BaseModel):
    attribute_id: int

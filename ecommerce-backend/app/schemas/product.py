from typing import Optional
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    base_price: float = Field(gt=0)
    category_id: Optional[int] = None
    low_stock_threshold: int = 5


class ProductUpdate(BaseModel):
    # All optional — this is a PATCH-style partial update schema
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = Field(default=None, gt=0)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    low_stock_threshold: Optional[int] = None


class ProductRead(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    base_price: float
    is_active: bool
    category_id: Optional[int]
    category: Optional["CategoryRead"] = None
    variants: list["VariantRead"] = []
    images: list["ImageRead"] = []

    class Config:
        from_attributes = True


class CategoryRead(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class VariantRead(BaseModel):
    id: int
    sku: str
    price_override: Optional[float] = None
    stock_qty: int
    attributes: str = "{}"

    class Config:
        from_attributes = True


class ImageRead(BaseModel):
    id: int
    url: str
    position: int = 0

    class Config:
        from_attributes = True


class AdminProductRead(ProductRead):
    """Extended product read for admin — includes inventory info."""
    total_stock: int = 0
    is_low_stock: bool = False
    low_stock_threshold: int = 5


class InventoryAlertItem(BaseModel):
    id: int
    name: str
    slug: str
    total_stock: int
    low_stock_threshold: int
    is_low_stock: bool
    category_name: str = ""
    image_url: str = ""


class InventoryAlertsResponse(BaseModel):
    items: list[InventoryAlertItem]
    total: int


class SearchResults(BaseModel):
    items: list[ProductRead]
    total: int

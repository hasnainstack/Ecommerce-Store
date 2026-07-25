from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: str = Field(index=True, unique=True)
    description: str = ""
    image_url: str = ""

    products: List["Product"] = Relationship(back_populates="category")
    attributes: List["CategoryAttribute"] = Relationship(back_populates="category", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class CategoryAttribute(SQLModel, table=True):
    """Maps an attribute (Size, Color, …) to a category so the product form knows
    which dynamic inputs to render when that category is selected."""
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id", index=True)
    attribute_id: int = Field(foreign_key="attribute.id")

    category: Optional[Category] = Relationship(back_populates="attributes")
    attribute: Optional["Attribute"] = Relationship()


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: str = Field(index=True, unique=True)
    description: str = ""
    base_price: float  # store in smallest currency unit (cents) in real production use
    is_active: bool = Field(default=True)  # soft delete flag — never hard-delete a sold product
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    category: Optional[Category] = Relationship(back_populates="products")
    variants: List["ProductVariant"] = Relationship(back_populates="product")
    images: List["ProductImage"] = Relationship(back_populates="product")


class ProductVariant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    sku: str = Field(index=True, unique=True)
    price_override: Optional[float] = None
    stock_qty: int = Field(default=0)
    attributes: str = "{}"  # JSON string, e.g. {"size": "M", "color": "black"}

    product: Optional[Product] = Relationship(back_populates="variants")


class ProductImage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    url: str
    position: int = Field(default=0)

    product: Optional[Product] = Relationship(back_populates="images")

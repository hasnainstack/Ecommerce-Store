from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Attribute(SQLModel, table=True):
    __tablename__ = "attribute"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    type: str = Field(default="select")  # "select" | "multiselect" | "text"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    values: List["AttributeValue"] = Relationship(back_populates="attribute", sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "AttributeValue.sort_order"})


class AttributeValue(SQLModel, table=True):
    __tablename__ = "attribute_value"
    id: Optional[int] = Field(default=None, primary_key=True)
    attribute_id: int = Field(foreign_key="attribute.id", index=True)
    value: str
    sort_order: int = Field(default=0)
    extra_data: str = Field(default="{}")  # optional JSON, e.g. {"unit": "ml"}

    attribute: Optional[Attribute] = Relationship(back_populates="values")

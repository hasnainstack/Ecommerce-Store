from typing import Optional, List
from sqlmodel import Session, select
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(session: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def get_product(session: Session, product_id: int) -> Optional[Product]:
    return session.get(Product, product_id)


def list_products(session: Session, skip: int = 0, limit: int = 50) -> List[Product]:
    statement = select(Product).where(Product.is_active == True).offset(skip).limit(limit)
    return session.exec(statement).all()


def update_product(session: Session, product_id: int, data: ProductUpdate) -> Optional[Product]:
    product = session.get(Product, product_id)
    if not product:
        return None
    updates = data.model_dump(exclude_unset=True)  # only fields the client actually sent
    for field, value in updates.items():
        setattr(product, field, value)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def soft_delete_product(session: Session, product_id: int) -> bool:
    # Never hard-delete: past orders reference this product's id
    product = session.get(Product, product_id)
    if not product:
        return False
    product.is_active = False
    session.add(product)
    session.commit()
    return True

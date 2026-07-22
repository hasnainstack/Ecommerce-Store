"""PostgreSQL full-text search on products."""

from typing import Optional
from sqlmodel import Session, select, func
from app.models.product import Product


def search_products(
    session: Session,
    *,
    query: str = "",
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[Product], int]:
    """Full-text search on product name + description.

    Returns (products, total_count).
    Empty query with no category returns ([], 0).
    """
    if not query and category_id is None:
        return [], 0

    base_conditions = [Product.is_active == True]

    if query:
        tsquery = func.plainto_tsquery("english", query)
        tsvector = func.to_tsvector("english", Product.name + " " + Product.description)
        base_conditions.append(tsvector.op("@@")(tsquery))

    if category_id is not None:
        base_conditions.append(Product.category_id == category_id)

    count_stmt = select(func.count()).where(*base_conditions)
    total = session.exec(count_stmt).one()

    stmt = select(Product).where(*base_conditions)

    if query:
        tsvector = func.to_tsvector("english", Product.name + " " + Product.description)
        tsquery = func.plainto_tsquery("english", query)
        stmt = stmt.order_by(func.ts_rank(tsvector, tsquery).desc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    products = session.exec(stmt.offset(skip).limit(limit)).all()
    return list(products), total

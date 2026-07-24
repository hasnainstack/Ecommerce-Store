from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.schemas.product import CategoryRead
from app.models.product import Category

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryRead])
def list_categories(session: Session = Depends(get_session)):
    """List all available categories."""
    stmt = select(Category).order_by(Category.name)
    return session.exec(stmt).all()
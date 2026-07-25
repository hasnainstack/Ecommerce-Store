from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.page import Page
from app.services.audit import log_activity

router = APIRouter(tags=["cms"])
admin_router = APIRouter(prefix="/admin/cms/pages", tags=["admin"])


# ── Schemas ───────────────────────────────────────────────────────

class PageRead(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    meta_description: str
    published: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class PageCreate(BaseModel):
    title: str
    slug: str
    content: str = ""
    meta_description: str = ""
    published: bool = False


class PageUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    meta_description: Optional[str] = None
    published: Optional[bool] = None


def _to_read(p: Page) -> PageRead:
    return PageRead(
        id=p.id,
        title=p.title,
        slug=p.slug,
        content=p.content,
        meta_description=p.meta_description,
        published=p.published,
        created_at=p.created_at.isoformat() if p.created_at else "",
        updated_at=p.updated_at.isoformat() if p.updated_at else "",
    )


# ── Public routes ─────────────────────────────────────────────────

@router.get("/pages/{slug}", response_model=PageRead)
def get_page(slug: str, session: Session = Depends(get_session)):
    """Public: get a published page by slug."""
    page = session.exec(
        select(Page).where(Page.slug == slug, Page.published == True)
    ).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return _to_read(page)


@router.get("/pages", response_model=List[PageRead])
def list_pages(session: Session = Depends(get_session)):
    """Public: list published pages."""
    pages = session.exec(
        select(Page).where(Page.published == True).order_by(Page.title)
    ).all()
    return [_to_read(p) for p in pages]


# ── Admin routes ──────────────────────────────────────────────────

@admin_router.get("", response_model=List[PageRead])
def admin_list_pages(
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """List all pages (published + draft)."""
    pages = session.exec(select(Page).order_by(Page.updated_at.desc())).all()
    return [_to_read(p) for p in pages]


@admin_router.post("", response_model=PageRead, status_code=201)
def create_page(
    data: PageCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    """Create a new CMS page."""
    existing = session.exec(select(Page).where(Page.slug == data.slug)).first()
    if existing:
        raise HTTPException(status_code=400, detail="A page with this slug already exists")

    page = Page(**data.model_dump())
    session.add(page)
    session.commit()
    session.refresh(page)

    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="create", entity_type="page", entity_id=str(page.id),
        details={"title": page.title, "slug": page.slug},
        ip_address=request.client.host if request else "",
    )
    session.commit()
    return _to_read(page)


@admin_router.get("/{page_id}", response_model=PageRead)
def get_admin_page(
    page_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    page = session.get(Page, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return _to_read(page)


@admin_router.patch("/{page_id}", response_model=PageRead)
def update_page(
    page_id: int,
    data: PageUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    page = session.get(Page, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    updates = data.model_dump(exclude_unset=True)

    # If slug is being changed, check no conflict
    if "slug" in updates and updates["slug"] != page.slug:
        existing = session.exec(select(Page).where(Page.slug == updates["slug"])).first()
        if existing:
            raise HTTPException(status_code=400, detail="A page with this slug already exists")

    for field, value in updates.items():
        setattr(page, field, value)

    page.updated_at = datetime.now(timezone.utc)
    session.add(page)
    session.commit()
    session.refresh(page)

    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="update", entity_type="page", entity_id=str(page_id),
        details={"title": page.title, "updated_fields": list(updates.keys())},
        ip_address=request.client.host if request else "",
    )
    session.commit()
    return _to_read(page)


@admin_router.delete("/{page_id}", status_code=204)
def delete_page(
    page_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    page = session.get(Page, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    title = page.title
    session.delete(page)
    session.commit()

    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="delete", entity_type="page", entity_id=str(page_id),
        details={"title": title},
        ip_address=request.client.host if request else "",
    )
    session.commit()

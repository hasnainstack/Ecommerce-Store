from typing import List, Optional
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.api.deps import require_admin
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead, SearchResults, ImageRead, InventoryAlertItem, InventoryAlertsResponse
from app.crud import product as product_crud
from app.services.search import search_products
from app.services.image_service import add_images, remove_image as delete_image_svc
from app.services.audit import log_activity
from app.models.product import Product, ProductVariant, Category

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[ProductRead])
def list_products(skip: int = 0, limit: int = 50, session: Session = Depends(get_session)):
    return product_crud.list_products(session, skip=skip, limit=limit)


@router.get("/search", response_model=SearchResults)
def search(
    q: str = Query(default=""),
    category_id: Optional[int] = Query(default=None),
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    products, total = search_products(
        session, query=q, category_id=category_id, skip=skip, limit=limit,
    )
    return SearchResults(items=products, total=total)


@router.get("/slug/{slug}", response_model=ProductRead)
def get_product_by_slug(slug: str, session: Session = Depends(get_session)):
    product = product_crud.get_product_by_slug(session, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = product_crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductRead, status_code=201)
def create_product(
    data: ProductCreate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    product = product_crud.create_product(session, data)
    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="create", entity_type="product", entity_id=str(product.id),
        details={"name": product.name}, ip_address=request.client.host if request else "",
    )
    session.commit()
    return product


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    data: ProductUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    product = product_crud.update_product(session, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="update", entity_type="product", entity_id=str(product_id),
        details={"name": product.name}, ip_address=request.client.host if request else "",
    )
    session.commit()
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    ok = product_crud.soft_delete_product(session, product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="delete", entity_type="product", entity_id=str(product_id),
        ip_address=request.client.host if request else "",
    )
    session.commit()


# ─── Image endpoints ────────────────────────────────────────────


@router.post("/{product_id}/images", response_model=List[ImageRead], status_code=201)
def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Upload one or more images for a product."""
    try:
        images = add_images(session, product_id, files)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return images


@router.delete("/{product_id}/images/{image_id}", status_code=204)
def delete_product_image(
    product_id: int,
    image_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Delete a single product image."""
    ok = delete_image_svc(session, image_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Image not found")


# ─── Admin product endpoints ────────────────────────────────────

from sqlmodel import select as sql_select


@router.get("/admin/list", response_model=List[ProductRead])
def admin_list_products(
    low_stock: Optional[bool] = Query(default=None, description="Filter to low-stock products"),
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Admin product listing with optional low-stock filter."""
    from sqlalchemy.orm import selectinload
    stmt = (
        sql_select(Product)
        .options(selectinload(Product.variants))
        .options(selectinload(Product.images))
        .options(selectinload(Product.category))
        .offset(skip)
        .limit(limit)
    )
    all_products = session.exec(stmt).all()

    if low_stock:
        filtered = []
        for p in all_products:
            total = sum(v.stock_qty for v in (p.variants or []))
            if total < p.low_stock_threshold:
                filtered.append(p)
        return filtered

    return all_products


@router.get("/admin/inventory-alerts", response_model=InventoryAlertsResponse)
def inventory_alerts(
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Return all products where total stock is below threshold."""
    from sqlalchemy.orm import selectinload
    products = session.exec(
        sql_select(Product)
        .options(selectinload(Product.variants))
        .options(selectinload(Product.category))
        .options(selectinload(Product.images))
    ).all()

    alerts = []
    for p in products:
        total_stock = sum(v.stock_qty for v in (p.variants or []))
        if total_stock < p.low_stock_threshold:
            alerts.append(InventoryAlertItem(
                id=p.id,
                name=p.name,
                slug=p.slug,
                total_stock=total_stock,
                low_stock_threshold=p.low_stock_threshold,
                is_low_stock=True,
                category_name=p.category.name if p.category else "",
                image_url=p.images[0].url if p.images else "",
            ))

    return InventoryAlertsResponse(items=alerts, total=len(alerts))


# ─── CSV Export / Import ──────────────────────────────────────────


@router.get("/admin/export/csv")
def export_products_csv(
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Export all products with their variants as a CSV file."""
    from sqlalchemy.orm import selectinload
    products = session.exec(
        select(Product)
        .options(selectinload(Product.variants))
        .options(selectinload(Product.category))
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "product_name", "product_slug", "description", "base_price",
        "category", "low_stock_threshold", "is_active",
        "variant_sku", "variant_price", "stock_qty", "attributes",
    ])

    for p in products:
        cat_name = p.category.name if p.category else ""
        if p.variants:
            for v in p.variants:
                writer.writerow([
                    p.name, p.slug, p.description, p.base_price,
                    cat_name, p.low_stock_threshold, p.is_active,
                    v.sku, v.price_override or "", v.stock_qty, v.attributes,
                ])
        else:
            writer.writerow([
                p.name, p.slug, p.description, p.base_price,
                cat_name, p.low_stock_threshold, p.is_active,
                "", "", "", "",
            ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


class CSVImportResult(BaseModel):
    created: int
    updated: int
    errors: list[str]


@router.post("/admin/import/csv", response_model=CSVImportResult)
def import_products_csv(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Import products from a CSV file. Matches by product slug, creates/updates variants by SKU."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")

    content = file.file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))

    required = {"product_name", "product_slug"}
    headers = set(reader.fieldnames or [])
    missing = required - headers
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(sorted(missing))}")

    created = 0
    updated = 0
    errors: list[str] = []

    for row_idx, row in enumerate(reader, start=2):
        try:
            slug = row.get("product_slug", "").strip()
            if not slug:
                errors.append(f"Row {row_idx}: missing product_slug")
                continue

            name = row.get("product_name", "").strip()
            if not name:
                errors.append(f"Row {row_idx}: missing product_name")
                continue

            # Resolve category
            cat_name = row.get("category", "").strip()
            cat_id = None
            if cat_name:
                cat = session.exec(select(Category).where(Category.name == cat_name)).first()
                if cat:
                    cat_id = cat.id
                else:
                    # Create category on the fly
                    import re
                    cat_slug = cat_name.lower().replace(" ", "-")
                    cat_slug = re.sub(r"[^a-z0-9-]", "", cat_slug)
                    cat = Category(name=cat_name, slug=cat_slug)
                    session.add(cat)
                    session.flush()
                    cat_id = cat.id

            # Find or create product
            product = session.exec(select(Product).where(Product.slug == slug)).first()
            if product:
                product.name = name
                product.description = row.get("description", product.description)
                try:
                    product.base_price = float(row.get("base_price", product.base_price))
                except (ValueError, TypeError):
                    pass
                try:
                    product.low_stock_threshold = int(row.get("low_stock_threshold", product.low_stock_threshold))
                except (ValueError, TypeError):
                    pass
                product.category_id = cat_id or product.category_id
                if row.get("is_active", "").strip().lower() in ("0", "false", "no", ""):
                    product.is_active = False
                else:
                    product.is_active = True
                session.add(product)
                updated += 1
            else:
                try:
                    base_price = float(row.get("base_price", 0))
                except (ValueError, TypeError):
                    base_price = 0
                try:
                    threshold = int(row.get("low_stock_threshold", 5))
                except (ValueError, TypeError):
                    threshold = 5
                product = Product(
                    name=name,
                    slug=slug,
                    description=row.get("description", ""),
                    base_price=base_price,
                    category_id=cat_id,
                    low_stock_threshold=threshold,
                    is_active=row.get("is_active", "1").strip().lower() not in ("0", "false", "no"),
                )
                session.add(product)
                session.flush()
                created += 1

            # Handle variant
            sku = row.get("variant_sku", "").strip()
            if sku:
                variant = session.exec(
                    select(ProductVariant).where(ProductVariant.sku == sku)
                ).first()
                if variant:
                    try:
                        variant.stock_qty = int(row.get("stock_qty", variant.stock_qty))
                    except (ValueError, TypeError):
                        pass
                    try:
                        vp = row.get("variant_price", "")
                        variant.price_override = float(vp) if vp else None
                    except (ValueError, TypeError):
                        pass
                    if row.get("attributes"):
                        variant.attributes = row["attributes"]
                    session.add(variant)
                else:
                    try:
                        stock = int(row.get("stock_qty", 0))
                    except (ValueError, TypeError):
                        stock = 0
                    try:
                        vp = row.get("variant_price", "")
                        price_override = float(vp) if vp else None
                    except (ValueError, TypeError):
                        price_override = None
                    variant = ProductVariant(
                        product_id=product.id,
                        sku=sku,
                        stock_qty=stock,
                        price_override=price_override,
                        attributes=row.get("attributes", "{}"),
                    )
                    session.add(variant)

        except Exception as e:
            errors.append(f"Row {row_idx}: {e}")

    session.commit()
    return CSVImportResult(created=created, updated=updated, errors=errors)


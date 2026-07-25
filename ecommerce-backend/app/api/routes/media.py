import os
import uuid
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Query
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.media import Media
from app.services.audit import log_activity

router = APIRouter(prefix="/admin/media", tags=["admin"])

# Uploads directory
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ── Schemas ─────────────────────────────────────────────────────

class MediaRead(BaseModel):
    id: int
    filename: str
    original_name: str
    mime_type: str
    file_size: int
    alt_text: str
    url: str  # computed
    created_at: str

    class Config:
        from_attributes = True


class MediaUploadResponse(BaseModel):
    items: List[MediaRead]


# ── Helpers ─────────────────────────────────────────────────────

def _media_to_read(m: Media) -> MediaRead:
    return MediaRead(
        id=m.id,
        filename=m.filename,
        original_name=m.original_name,
        mime_type=m.mime_type,
        file_size=m.file_size,
        alt_text=m.alt_text,
        url=f"/uploads/{m.filename}",
        created_at=m.created_at.isoformat() if m.created_at else "",
    )


def _validate_file(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError(
            f"Unsupported file type '{file.content_type}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_TYPES))}"
        )
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_FILE_SIZE:
        raise ValueError(f"File too large ({size} bytes). Max: {MAX_FILE_SIZE} bytes.")


# ── Endpoints ───────────────────────────────────────────────────


@router.get("", response_model=List[MediaRead])
def list_media(
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """List all uploaded media, newest first."""
    items = session.exec(
        select(Media).order_by(Media.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return [_media_to_read(m) for m in items]


@router.post("/upload", response_model=MediaUploadResponse, status_code=201)
def upload_media(
    files: List[UploadFile] = File(...),
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    """Upload one or more files to the media library."""
    created: list[Media] = []
    for file in files:
        try:
            _validate_file(file)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        ext = file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "png"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = UPLOAD_DIR / filename

        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)

        file_size = filepath.stat().st_size

        media = Media(
            filename=filename,
            original_name=file.filename or filename,
            mime_type=file.content_type or "image/png",
            file_size=file_size,
        )
        session.add(media)
        created.append(media)

    session.commit()
    for m in created:
        session.refresh(m)

    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="create", entity_type="media",
        details={"count": len(created), "names": [m.original_name for m in created]},
        ip_address=request.client.host if request else "",
    )
    session.commit()

    return MediaUploadResponse(items=[_media_to_read(m) for m in created])


@router.patch("/{media_id}")
def update_media(
    media_id: int,
    alt_text: str = Query(default=""),
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Update media metadata (e.g. alt text)."""
    media = session.get(Media, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    media.alt_text = alt_text
    session.add(media)
    session.commit()
    session.refresh(media)
    return _media_to_read(media)


@router.delete("/{media_id}", status_code=204)
def delete_media(
    media_id: int,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
    request: Request = None,
):
    """Delete a media file from disk and database."""
    media = session.get(Media, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    orig_name = media.original_name

    # Delete file from disk
    filepath = UPLOAD_DIR / media.filename
    if filepath.exists():
        filepath.unlink()

    session.delete(media)
    session.commit()

    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="delete", entity_type="media", entity_id=str(media_id),
        details={"original_name": orig_name},
        ip_address=request.client.host if request else "",
    )
    session.commit()

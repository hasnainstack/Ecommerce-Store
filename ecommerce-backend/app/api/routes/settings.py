from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.settings import SiteSettings
from app.schemas.settings import SiteSettingsRead, SiteSettingsUpdate

router = APIRouter(prefix="/admin/settings", tags=["admin"])


def _get_or_create(session: Session) -> SiteSettings:
    """Return existing settings (id=1) or create default row."""
    s = session.get(SiteSettings, 1)
    if s is None:
        s = SiteSettings(id=1)
        session.add(s)
        session.commit()
        session.refresh(s)
    return s


@router.get("", response_model=SiteSettingsRead)
def get_settings(
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    return _get_or_create(session)


@router.patch("", response_model=SiteSettingsRead)
def update_settings(
    data: SiteSettingsUpdate,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    s = _get_or_create(session)

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(s, field, value)

    s.updated_at = datetime.now(timezone.utc)
    session.add(s)
    session.commit()
    session.refresh(s)
    return s

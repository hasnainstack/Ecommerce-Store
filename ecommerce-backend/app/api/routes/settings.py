from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, EmailStr
from sqlmodel import Session
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.settings import SiteSettings
from app.schemas.settings import SiteSettingsRead, SiteSettingsUpdate
from app.services.audit import log_activity
from app.utils.email import send_email

router = APIRouter(prefix="/admin/settings", tags=["admin"])


class TestEmailRequest(BaseModel):
    to_email: str


class TestEmailResponse(BaseModel):
    ok: bool
    detail: str


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
    request: Request = None,
):
    s = _get_or_create(session)

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(s, field, value)

    s.updated_at = datetime.now(timezone.utc)
    session.add(s)
    session.commit()
    session.refresh(s)

    log_activity(
        session, actor_id=_admin.id, actor_email=_admin.email,
        action="update", entity_type="settings", entity_id="1",
        details={"updated_fields": list(updates.keys())},
        ip_address=request.client.host if request else "",
    )
    session.commit()
    return s


@router.post("/test-email", response_model=TestEmailResponse)
def test_email(
    body: TestEmailRequest,
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    """Send a test email using the current SMTP config."""
    s = _get_or_create(session)

    result = send_email(
        to=body.to_email,
        subject=f"Test email from {s.site_name or 'Store'}",
        body_text=f"Hello!\n\nThis is a test email from your store. If you're reading this, SMTP is configured correctly.\n\n— {s.site_name or 'Store'}",
        body_html=f"""
        <h2>SMTP Test — Success!</h2>
        <p>This is a test email from <strong>{s.site_name or 'Store'}</strong>.</p>
        <p>If you're reading this, SMTP is configured correctly.</p>
        <hr>
        <p style="color:#888;font-size:12px;">Sent from your store admin panel</p>
        """,
        smtp_host=s.smtp_host,
        smtp_port=s.smtp_port,
        smtp_user=s.smtp_user,
        smtp_password=s.smtp_password,
        from_email=s.from_email,
        use_tls=s.smtp_use_tls,
    )

    return TestEmailResponse(ok=result["ok"], detail=result["detail"])

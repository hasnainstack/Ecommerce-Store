import json
from typing import Optional
from sqlmodel import Session
from app.models.activity import ActivityLog


def log_activity(
    session: Session,
    *,
    actor_id: Optional[int] = None,
    actor_email: str = "",
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    details: Optional[dict] = None,
    ip_address: str = "",
) -> ActivityLog:
    """Record an audit-log entry and flush (not commit) so it can be part of a larger transaction."""
    entry = ActivityLog(
        actor_id=actor_id,
        actor_email=actor_email,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        details=json.dumps(details) if details else "",
        ip_address=ip_address,
    )
    session.add(entry)
    session.flush()
    return entry

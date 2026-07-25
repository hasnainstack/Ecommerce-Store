from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class SiteSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    site_name: str = "Store"
    site_description: str = ""
    contact_email: str = ""
    contact_phone: str = ""
    address: str = ""
    currency: str = "USD"
    tax_rate: float = 0.0
    shipping_fee: float = 0.0
    free_shipping_min: float = 0.0
    facebook_url: str = ""
    twitter_url: str = ""
    instagram_url: str = ""
    logo_url: str = ""
    favicon_url: str = ""

    # SMTP
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    from_email: str = ""

    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

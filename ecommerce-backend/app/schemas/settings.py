from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SiteSettingsRead(BaseModel):
    id: int
    site_name: str
    site_description: str
    contact_email: str
    contact_phone: str
    address: str
    currency: str
    tax_rate: float
    shipping_fee: float
    free_shipping_min: float
    facebook_url: str
    twitter_url: str
    instagram_url: str
    logo_url: str
    favicon_url: str
    updated_at: datetime

    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    site_description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    shipping_fee: Optional[float] = None
    free_shipping_min: Optional[float] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    instagram_url: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None

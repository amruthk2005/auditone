from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import re

class VendorBase(BaseModel):
    company_id: Optional[int] = 1
    vendor_name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_indian_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return v
        clean = re.sub(r"[\s\-]", "", v.strip())
        if not re.match(r"^(?:\+?91|0)?[6-9]\d{9}$", clean):
            raise ValueError("Phone number must be a valid 10-digit Indian phone number (e.g. +91 98765 43210 or 9876543210 starting with 6, 7, 8, or 9).")
        return v

class VendorCreate(VendorBase):
    pass

class VendorResponse(VendorBase):
    vendor_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VendorBase(BaseModel):
    company_id: int
    vendor_name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None

class VendorCreate(VendorBase):
    pass

class VendorResponse(VendorBase):
    vendor_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

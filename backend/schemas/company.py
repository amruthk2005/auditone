from pydantic import BaseModel
from typing import Optional

class CompanyBase(BaseModel):
    company_name: str
    gst_number: Optional[str] = None
    company_type: Optional[str] = None
    address: Optional[str] = None
    contact_details: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    company_id: int

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import date

class AuditBase(BaseModel):
    company_id: int
    type: str
    audit_date: date
    auditor_name: str
    scope: Optional[str] = None
    instructions: Optional[str] = None
    status: Optional[str] = "Scheduled"

class AuditCreate(AuditBase):
    pass

class AuditResponse(AuditBase):
    id: int

    class Config:
        from_attributes = True

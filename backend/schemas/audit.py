from pydantic import BaseModel
from typing import Optional
from datetime import date

class AuditBase(BaseModel):
    auditor_name: str
    audit_date: date
    company_id: Optional[int] = 1
    type: Optional[str] = "Physical Stock Audit"
    scope: Optional[str] = None
    instructions: Optional[str] = None
    status: Optional[str] = "Scheduled"

class AuditCreate(AuditBase):
    pass

class AuditUpdate(BaseModel):
    auditor_name: Optional[str] = None
    audit_date: Optional[date] = None
    company_id: Optional[int] = None
    type: Optional[str] = None
    scope: Optional[str] = None
    instructions: Optional[str] = None
    status: Optional[str] = None

class AuditResponse(AuditBase):
    id: int

    class Config:
        from_attributes = True

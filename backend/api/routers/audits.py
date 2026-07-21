from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.audit import Audit
from backend.schemas.audit import AuditResponse, AuditCreate, AuditUpdate

router = APIRouter()

from datetime import date, timedelta

INITIAL_AUDITS = [
    {
        "company_id": 1,
        "type": "Physical Stock Audit",
        "audit_date": date.today() + timedelta(days=5),
        "auditor_name": "Rohan Sharma (Lead Auditor)",
        "scope": "Warehouse A & HQ Floor 3",
        "instructions": "Verify all computing and peripheral assets via QR scan.",
        "status": "Scheduled"
    },
    {
        "company_id": 1,
        "type": "Asset Valuation Audit",
        "audit_date": date.today() - timedelta(days=2),
        "auditor_name": "Priya Verma (Senior Auditor)",
        "scope": "HQ Operations & Printing Unit",
        "instructions": "Verify depreciation ledger against physical asset conditions.",
        "status": "In Progress"
    },
    {
        "company_id": 1,
        "type": "Compliance Audit",
        "audit_date": date.today() - timedelta(days=10),
        "auditor_name": "Anish Kumar",
        "scope": "All Locations",
        "instructions": "Annual physical inventory compliance verification.",
        "status": "Completed"
    }
]

@router.get("", response_model=List[AuditResponse])
def read_audits(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    audits = db.query(Audit).offset(skip).limit(limit).all()
    if not audits:
        for seed in INITIAL_AUDITS:
            db.add(Audit(**seed))
        db.commit()
        audits = db.query(Audit).offset(skip).limit(limit).all()
    return audits

@router.post("", response_model=AuditResponse)
def create_audit(
    *,
    db: Session = Depends(deps.get_db),
    audit_in: AuditCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    audit = Audit(
        company_id=audit_in.company_id or 1,
        type=audit_in.type or "Physical Stock Audit",
        audit_date=audit_in.audit_date,
        auditor_name=audit_in.auditor_name,
        scope=audit_in.scope,
        instructions=audit_in.instructions,
        status=audit_in.status or "Scheduled"
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit

@router.get("/{audit_id}", response_model=AuditResponse)
def read_audit(
    audit_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit

@router.put("/{audit_id}", response_model=AuditResponse)
def update_audit(
    *,
    db: Session = Depends(deps.get_db),
    audit_id: int,
    audit_in: AuditUpdate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    update_data = audit_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(audit, field, value)
        
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit

@router.delete("/{audit_id}", response_model=AuditResponse)
def delete_audit(
    *,
    db: Session = Depends(deps.get_db),
    audit_id: int,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    db.delete(audit)
    db.commit()
    return audit

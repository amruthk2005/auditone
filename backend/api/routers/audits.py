from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.audit import Audit
from backend.schemas.audit import AuditResponse, AuditCreate

router = APIRouter()

@router.get("", response_model=List[AuditResponse])
def read_audits(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
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
        company_id=audit_in.company_id,
        type=audit_in.type,
        audit_date=audit_in.audit_date,
        auditor_name=audit_in.auditor_name,
        scope=audit_in.scope,
        instructions=audit_in.instructions,
        status=audit_in.status
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

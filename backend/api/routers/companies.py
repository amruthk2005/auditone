from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.company import Company
from backend.schemas.company import CompanyResponse, CompanyCreate

router = APIRouter()

@router.get("", response_model=List[CompanyResponse])
def read_companies(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies

@router.post("", response_model=CompanyResponse)
def create_company(
    *,
    db: Session = Depends(deps.get_db),
    company_in: CompanyCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    company = Company(
        company_name=company_in.company_name,
        gst_number=company_in.gst_number,
        company_type=company_in.company_type,
        address=company_in.address,
        contact_details=company_in.contact_details
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

from pydantic import BaseModel

class WorkspaceSettingsUpdate(BaseModel):
    company_name: str = "Acme Corp"
    industry: str = "Technology"
    timezone: str = "UTC+05:30 — India Standard Time"

@router.put("/workspace")
def update_workspace_settings(
    payload: WorkspaceSettingsUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    company = db.query(Company).first()
    if company:
        company.company_name = payload.company_name
        company.company_type = payload.industry
        db.add(company)
        db.commit()
        db.refresh(company)

    return {
        "message": "Workspace settings saved successfully",
        "workspace": {
            "company_name": payload.company_name,
            "industry": payload.industry,
            "timezone": payload.timezone,
        }
    }

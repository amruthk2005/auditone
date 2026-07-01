from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.product import Product
from backend.models.company import Company
from backend.models.audit import Audit

router = APIRouter()

@router.get("/stats")
def read_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    products_count = db.query(Product).count()
    companies_count = db.query(Company).count()
    audits_count = db.query(Audit).count()
    
    return {
        "products_count": products_count,
        "companies_count": companies_count,
        "audits_count": audits_count
    }

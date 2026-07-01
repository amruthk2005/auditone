from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.company import Vendor
from backend.schemas.vendor import VendorResponse, VendorCreate

router = APIRouter()

@router.get("", response_model=List[VendorResponse])
def read_vendors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    vendors = db.query(Vendor).offset(skip).limit(limit).all()
    return vendors

@router.post("", response_model=VendorResponse)
def create_vendor(
    *,
    db: Session = Depends(deps.get_db),
    vendor_in: VendorCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    vendor = Vendor(
        company_id=vendor_in.company_id,
        vendor_name=vendor_in.vendor_name,
        contact_person=vendor_in.contact_person,
        email=vendor_in.email,
        phone=vendor_in.phone,
        gst_number=vendor_in.gst_number,
        address=vendor_in.address
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor

@router.get("/{vendor_id}", response_model=VendorResponse)
def read_vendor(
    vendor_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()
    return {"message": "Vendor deleted successfully"}

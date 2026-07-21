from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.company import Vendor
from backend.schemas.vendor import VendorResponse, VendorCreate

router = APIRouter()

INITIAL_VENDORS = [
    {"vendor_name": "Dell Technologies India", "contact_person": "Robert Vance", "email": "contact@dell.co.in", "phone": "+91 98765 43210", "gst_number": "27AAACD1234F1Z1", "address": "Bengaluru, Karnataka"},
    {"vendor_name": "Apple India Pvt Ltd", "contact_person": "Sarah Jenkins", "email": "enterprise@apple.in", "phone": "+91 91234 56789", "gst_number": "27AAACA9876E1Z5", "address": "Mumbai, Maharashtra"},
    {"vendor_name": "Logitech India", "contact_person": "Mark Stevens", "email": "support@logitech.in", "phone": "+91 99887 76655", "gst_number": "27AAACL5544B1Z8", "address": "Gurugram, Haryana"},
    {"vendor_name": "Cisco Systems India", "contact_person": "Elena Rostova", "email": "sales@cisco.in", "phone": "+91 98112 23344", "gst_number": "27AAACC3322D1Z9", "address": "Bengaluru, Karnataka"},
]

@router.get("", response_model=List[VendorResponse])
def read_vendors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    vendors = db.query(Vendor).offset(skip).limit(limit).all()
    if not vendors:
        for seed in INITIAL_VENDORS:
            v = Vendor(company_id=1, **seed)
            db.add(v)
        db.commit()
        vendors = db.query(Vendor).all()
    return vendors

@router.post("", response_model=VendorResponse)
def create_vendor(
    *,
    db: Session = Depends(deps.get_db),
    vendor_in: VendorCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    vendor = Vendor(
        company_id=vendor_in.company_id or 1,
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

@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: int,
    vendor_in: VendorCreate,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.vendor_name = vendor_in.vendor_name
    vendor.contact_person = vendor_in.contact_person
    vendor.email = vendor_in.email
    vendor.phone = vendor_in.phone
    vendor.gst_number = vendor_in.gst_number
    vendor.address = vendor_in.address

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

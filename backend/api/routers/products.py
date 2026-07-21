from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.product import Product
from backend.schemas.product import ProductResponse, ProductCreate, ProductUpdate

router = APIRouter()

INITIAL_PRODUCTS = [
    {"name": "Laptop Dell Latitude 5300", "category": "Computing", "quantity": 30, "cost": 1200.00, "location": "HQ Floor 3", "vendor": "Dell Technologies India", "serial_no": "SN-DL5300-X1", "status": "In Use"},
    {"name": "Wireless Ergonomic Mouse", "category": "Peripherals", "quantity": 50, "cost": 45.00, "location": "Warehouse A", "vendor": "Logitech India", "serial_no": "SN-WM102-Y2", "status": "In Use"},
    {"name": "Projector Epson EB-X41", "category": "AV Equipment", "quantity": 5, "cost": 780.00, "location": "Meeting Rm 2", "vendor": "Epson India", "serial_no": "SN-EBX41-Z3", "status": "In Storage"},
    {"name": "Monitor LG 24\" FHD", "category": "Displays", "quantity": 40, "cost": 320.00, "location": "HQ Floor 3", "vendor": "Apple India Pvt Ltd", "serial_no": "SN-LG24MK-A4", "status": "In Use"},
    {"name": "HP LaserJet Pro Printer", "category": "Printing", "quantity": 8, "cost": 450.00, "location": "HQ Floor 1", "vendor": "Cisco Systems India", "serial_no": "SN-HPL401-B5", "status": "Maintenance"},
    {"name": "Ergonomic Mesh Chair", "category": "Furniture", "quantity": 80, "cost": 220.00, "location": "Office Suite", "vendor": "Dell Technologies India", "serial_no": "SN-CHX2-C6", "status": "In Use"},
    {"name": "Mechanical Keyboard Logitech", "category": "Peripherals", "quantity": 60, "cost": 120.00, "location": "Warehouse A", "vendor": "Logitech India", "serial_no": "SN-SKG913-D7", "status": "In Storage"},
]

@router.get("", response_model=List[ProductResponse])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    products = db.query(Product).offset(skip).limit(limit).all()
    if not products:
        for seed in INITIAL_PRODUCTS:
            p = Product(**seed)
            db.add(p)
        db.commit()
        products = db.query(Product).all()
    return products

@router.post("", response_model=ProductResponse)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
    product_in: ProductCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    product = Product(
        name=product_in.name,
        category=product_in.category,
        quantity=product_in.quantity,
        cost=product_in.cost,
        purchase_date=product_in.purchase_date,
        serial_no=product_in.serial_no,
        location=product_in.location,
        vendor=product_in.vendor,
        description=product_in.description,
        status=product_in.status
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/{product_id}", response_model=ProductResponse)
def read_product(
    product_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    *,
    db: Session = Depends(deps.get_db),
    product_in: ProductUpdate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

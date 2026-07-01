from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.product import Product
from backend.schemas.product import ProductResponse, ProductCreate

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    products = db.query(Product).offset(skip).limit(limit).all()
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

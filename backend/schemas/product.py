from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date

class ProductBase(BaseModel):
    name: str
    category: str
    quantity: int = 0
    cost: Decimal = Decimal("0.00")
    purchase_date: Optional[date] = None
    serial_no: Optional[str] = None
    location: Optional[str] = None
    vendor: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Pending"

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

class QRCodeBase(BaseModel):
    product_id: Optional[int] = None
    qr_code: str
    barcode_type: Optional[str] = "QR"
    generated_date: Optional[date] = None

class QRCodeCreate(QRCodeBase):
    pass

class QRCodeResponse(QRCodeBase):
    qr_id: int

    class Config:
        from_attributes = True

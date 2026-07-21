from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date

from typing import Optional, Union

class ProductBase(BaseModel):
    name: str = "Unnamed Product"
    category: str = "General"
    quantity: Optional[int] = 1
    cost: Optional[Union[Decimal, float, int]] = 0.0
    purchase_date: Optional[date] = None
    serial_no: Optional[str] = None
    location: Optional[str] = None
    vendor: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "In Use"

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    cost: Optional[Decimal] = None
    purchase_date: Optional[date] = None
    serial_no: Optional[str] = None
    location: Optional[str] = None
    vendor: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

class QRCodeBase(BaseModel):
    product_id: Optional[int] = None
    qr_code: str
    barcode_type: Optional[str] = "QR"
    generated_date: Optional[date] = None
    generation_type: Optional[str] = "SINGLE"
    batch_quantity: Optional[int] = 1
    location_tag: Optional[str] = None
    auditor_notes: Optional[str] = None
    metadata_json: Optional[str] = None

class QRCodeCreate(QRCodeBase):
    pass

class QRGenerateAdvancedRequest(BaseModel):
    product_id: Optional[int] = None
    generation_type: str = "SINGLE"
    generated_date: Optional[str] = None
    batch_quantity: int = 1
    location_tag: Optional[str] = None
    auditor_notes: Optional[str] = None

class QRCodeResponse(QRCodeBase):
    qr_id: int

    class Config:
        from_attributes = True

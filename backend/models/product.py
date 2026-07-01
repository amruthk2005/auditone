from sqlalchemy import Column, Integer, String, Text, DECIMAL, Date
from backend.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    cost = Column(DECIMAL(12,2), nullable=False, default=0.00)
    purchase_date = Column(Date, nullable=True)
    serial_no = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    vendor = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")

class QRCode(Base):
    __tablename__ = "qr_codes"

    qr_id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, nullable=True)
    qr_code = Column(String(100), unique=True, nullable=False)
    generated_date = Column(Date, nullable=True)
    barcode_type = Column(String(50), nullable=True)

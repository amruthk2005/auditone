from sqlalchemy import Column, Integer, String, Text, Date, TIMESTAMP, Enum
from sqlalchemy.sql import func
from backend.database import Base

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False)
    type = Column(String(50), nullable=False)
    audit_date = Column(Date, nullable=False)
    auditor_name = Column(String(100), nullable=False)
    scope = Column(String(255), nullable=True)
    instructions = Column(Text, nullable=True)
    status = Column(String(50), default='Scheduled')

class StockValidation(Base):
    __tablename__ = "stock_validations"

    validation_id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(Integer, nullable=False)
    qr_id = Column(Integer, nullable=False)
    validation_status = Column(String(50), nullable=True)
    remarks = Column(Text, nullable=True)
    timestamp = Column(TIMESTAMP, server_default=func.now())

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_session_id = Column(Integer, nullable=False)
    product_id = Column(Integer, nullable=True)
    scan_data = Column(String(255), nullable=False)
    status = Column(Enum('MATCHED','MISMATCHED','NEW'), nullable=True)
    notes = Column(Text, nullable=True)
    scanned_at = Column(TIMESTAMP, server_default=func.now())

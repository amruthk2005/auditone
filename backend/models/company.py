from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from backend.database import Base

class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=False)
    gst_number = Column(String(20), unique=True, nullable=True)
    company_type = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    contact_details = Column(Text, nullable=True)

class Department(Base):
    __tablename__ = "departments"
    
    dept_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False)
    department_name = Column(String(100), nullable=False)

class Vendor(Base):
    __tablename__ = "vendors"
    
    vendor_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False)
    vendor_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    gst_number = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

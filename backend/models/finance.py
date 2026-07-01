from sqlalchemy import Column, Integer, String, Text, Float, Enum, TIMESTAMP, Double, Date
from sqlalchemy.sql import func
from backend.database import Base

class FinanceRecord(Base):
    __tablename__ = "finance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, unique=True, nullable=False)
    purchase_price = Column(Float, nullable=False)
    depreciation_method = Column(Enum('STRAIGHT_LINE','DECLINING_BALANCE'), nullable=True)
    depreciation_rate = Column(Float, nullable=True)
    current_value = Column(Float, nullable=True)
    last_calculated_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())

class Depreciation(Base):
    __tablename__ = "depreciations"

    depreciation_id = Column(Integer, primary_key=True, autoincrement=True)
    method = Column(String(50), nullable=False)
    rate = Column(Double, nullable=False)
    useful_life = Column(Integer, nullable=False)

class Valuation(Base):
    __tablename__ = "valuations"

    valuation_id = Column(Integer, primary_key=True, autoincrement=True)
    depreciation_id = Column(Integer, nullable=True)
    current_value = Column(Double, nullable=False)
    depreciation_amount = Column(Double, nullable=False)
    valuation_date = Column(Date, nullable=False)

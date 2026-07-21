from sqlalchemy import Column, Integer, Text, Boolean, TIMESTAMP, Date, String
from sqlalchemy.sql import func
from backend.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=True, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(Integer, nullable=False)
    report_type = Column(String(100), nullable=True)
    generated_date = Column(Date, default=func.current_date())
    report_status = Column(String(50), nullable=True)

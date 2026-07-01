from sqlalchemy import Column, Integer, String, Text
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(191), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)

class CompanyUser(Base):
    __tablename__ = "company_users"

    user_id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False)
    dept_id = Column(Integer, nullable=True)

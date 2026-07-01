from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.models.finance import DepreciationMethod

class FinanceRecordBase(BaseModel):
    product_id: int
    purchase_price: float
    depreciation_method: Optional[DepreciationMethod] = DepreciationMethod.STRAIGHT_LINE
    depreciation_rate: Optional[float] = None
    current_value: Optional[float] = None

class FinanceRecordCreate(FinanceRecordBase):
    pass

class FinanceRecordUpdate(BaseModel):
    depreciation_method: Optional[DepreciationMethod] = None
    depreciation_rate: Optional[float] = None
    current_value: Optional[float] = None

class FinanceRecordInDBBase(FinanceRecordBase):
    id: int
    last_calculated_at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FinanceRecord(FinanceRecordInDBBase):
    pass

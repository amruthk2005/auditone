from pydantic import BaseModel
from typing import Optional

class DepartmentBase(BaseModel):
    company_id: Optional[int] = 1
    department_name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    dept_id: int

    class Config:
        from_attributes = True

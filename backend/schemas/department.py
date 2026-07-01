from pydantic import BaseModel

class DepartmentBase(BaseModel):
    company_id: int
    department_name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    dept_id: int

    class Config:
        from_attributes = True

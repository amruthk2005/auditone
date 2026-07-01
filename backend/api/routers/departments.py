from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.company import Department
from backend.schemas.department import DepartmentResponse, DepartmentCreate

router = APIRouter()

@router.get("", response_model=List[DepartmentResponse])
def read_departments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    departments = db.query(Department).offset(skip).limit(limit).all()
    return departments

@router.post("", response_model=DepartmentResponse)
def create_department(
    *,
    db: Session = Depends(deps.get_db),
    department_in: DepartmentCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    department = Department(
        company_id=department_in.company_id,
        department_name=department_in.department_name
    )
    db.add(department)
    db.commit()
    db.refresh(department)
    return department

@router.get("/{dept_id}", response_model=DepartmentResponse)
def read_department(
    dept_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    department = db.query(Department).filter(Department.dept_id == dept_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.delete("/{dept_id}")
def delete_department(
    dept_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    department = db.query(Department).filter(Department.dept_id == dept_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(department)
    db.commit()
    return {"message": "Department deleted successfully"}

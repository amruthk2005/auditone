from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.notification import Notification

router = APIRouter()

@router.get("/")
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    # Fallback to returning raw dicts for now
    notifications = db.query(Notification).filter(Notification.user_id == current_user.user_id).offset(skip).limit(limit).all()
    return notifications

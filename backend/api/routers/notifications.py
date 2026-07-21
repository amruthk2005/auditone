from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.notification import Notification

router = APIRouter()

INITIAL_NOTIFICATIONS = [
    {"title": "Q3 Fixed Asset Audit Scheduled", "message": "Audit #104 is scheduled for next Monday at HQ Floor 3.", "is_read": False},
    {"title": "New Asset Registered", "message": "MacBook Pro M3 Max (SN-88421) was successfully added to inventory.", "is_read": False},
    {"title": "Depreciation Ledger Updated", "message": "Annual depreciation calculations completed for 2026.", "is_read": True},
    {"title": "Vendor Contract Renewal Alert", "message": "Dell Technologies support agreement expires in 14 days.", "is_read": False},
]

@router.get("")
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Fetch notifications for current logged in user."""
    user_id = current_user.user_id if hasattr(current_user, "user_id") else 1
    items = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.id.desc()).offset(skip).limit(limit).all()
    
    if not items:
        # Auto-seed initial notifications for user
        for seed in INITIAL_NOTIFICATIONS:
            n = Notification(
                user_id=user_id,
                message=f"{seed['title']}|{seed['message']}",
                is_read=seed["is_read"]
            )
            db.add(n)
        db.commit()
        items = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.id.desc()).all()

    result = []
    for item in items:
        parts = (item.message or "").split("|", 1)
        title = parts[0] if len(parts) > 1 else "System Notification"
        msg = parts[1] if len(parts) > 1 else parts[0]
        created_str = item.created_at.strftime("%Y-%m-%d %H:%M") if item.created_at else "Just now"
        
        result.append({
            "id": item.id,
            "title": title,
            "message": msg,
            "read": bool(item.is_read),
            "is_read": bool(item.is_read),
            "time": created_str,
            "created_at": created_str,
        })
    return result


@router.put("/read-all")
@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Mark all notifications as read for current user."""
    user_id = current_user.user_id if hasattr(current_user, "user_id") else 1
    db.query(Notification).filter(Notification.user_id == user_id).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read", "success": True}


@router.put("/{notification_id}/read")
@router.post("/{notification_id}/read")
def mark_single_read(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Mark a single notification as read."""
    user_id = current_user.user_id if hasattr(current_user, "user_id") else 1
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not notif:
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    return {"message": f"Notification #{notification_id} marked as read", "success": True, "id": notification_id}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a notification."""
    user_id = current_user.user_id if hasattr(current_user, "user_id") else 1
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not notif:
        notif = db.query(Notification).filter(Notification.id == notification_id).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notif)
    db.commit()
    return {"message": f"Notification #{notification_id} deleted", "success": True}

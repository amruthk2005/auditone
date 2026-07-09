from typing import Any, List, Optional
import os
import shutil
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.api import deps
from backend.models.user import User, CompanyUser
from backend.models.company import Company
from backend.models.audit import Audit
from backend.models.chat import ChatMessage
from backend.models.notification import Notification
from backend.schemas.chat import ChatMessageResponse, ChatMessageCreate, ConversationResponse

router = APIRouter()

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # 1. Determine which audits this user has access to
    audits_query = db.query(Audit)
    
    if current_user.role == "admin":
        # Admins see all audits
        pass
    elif current_user.role == "company_user":
        # Resolve company
        co_user = db.query(CompanyUser).filter(CompanyUser.user_id == current_user.user_id).first()
        if not co_user:
            return []
        audits_query = audits_query.filter(Audit.company_id == co_user.company_id)
    elif current_user.role == "auditor":
        # Resolve auditor name
        audits_query = audits_query.filter(Audit.auditor_name == current_user.name)
    else:
        # Unknown role
        return []

    audits = audits_query.all()
    results = []

    for audit in audits:
        # Get company details
        company = db.query(Company).filter(Company.company_id == audit.company_id).first()
        company_name = company.company_name if company else f"Company #{audit.company_id}"

        # Get last message
        last_msg = db.query(ChatMessage).filter(ChatMessage.audit_id == audit.id).order_by(desc(ChatMessage.created_at)).first()
        
        last_msg_content = None
        last_updated = None
        if last_msg:
            if last_msg.message_type == "text":
                last_msg_content = last_msg.content
            else:
                last_msg_content = f"Shared an attachment: {last_msg.file_name or 'file'}"
            last_updated = last_msg.created_at

        # Calculate unread messages
        unread_count = 0
        if current_user.role == "company_user":
            unread_count = db.query(ChatMessage).filter(
                ChatMessage.audit_id == audit.id,
                ChatMessage.sender_role == "auditor",
                ChatMessage.status != "seen"
            ).count()
        elif current_user.role == "auditor":
            unread_count = db.query(ChatMessage).filter(
                ChatMessage.audit_id == audit.id,
                ChatMessage.sender_role == "company_user",
                ChatMessage.status != "seen"
            ).count()

        # Calculate completion percentage from audit status
        completion = 0
        if audit.status == "Completed":
            completion = 100
        elif audit.status == "In Progress":
            completion = 60
        elif audit.status == "Scheduled":
            completion = 10

        results.append(ConversationResponse(
            audit_id=audit.id,
            audit_name=audit.type,
            audit_status=audit.status,
            company_id=audit.company_id,
            company_name=company_name,
            auditor_name=audit.auditor_name,
            completion_percentage=completion,
            last_message=last_msg_content,
            last_updated=last_updated,
            unread_count=unread_count,
            active=True
        ))

    # Sort conversations by last updated time, putting active chats first
    results.sort(key=lambda x: x.last_updated or datetime.min, reverse=True)
    return results

@router.get("/conversations/{audit_id}/messages", response_model=List[ChatMessageResponse])
def get_messages(
    audit_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Check audit authorization
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    if current_user.role == "company_user":
        co_user = db.query(CompanyUser).filter(CompanyUser.user_id == current_user.user_id).first()
        if not co_user or co_user.company_id != audit.company_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    elif current_user.role == "auditor":
        if audit.auditor_name != current_user.name:
            raise HTTPException(status_code=403, detail="Not authorized to access this conversation")

    # Fetch messages
    messages = db.query(ChatMessage).filter(ChatMessage.audit_id == audit_id).order_by(ChatMessage.created_at).all()

    # Update unread messages to "seen" if current user is not admin
    if current_user.role != "admin":
        other_role = "auditor" if current_user.role == "company_user" else "company_user"
        unread_messages = [m for m in messages if m.sender_role == other_role and m.status != "seen"]
        for m in unread_messages:
            m.status = "seen"
        if unread_messages:
            db.commit()

    return messages

@router.post("/conversations/{audit_id}/messages", response_model=ChatMessageResponse)
def send_message(
    audit_id: int,
    message_in: ChatMessageCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Check authorization
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admins cannot send messages")

    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    company_id = audit.company_id
    co_user = None

    if current_user.role == "company_user":
        co_user = db.query(CompanyUser).filter(CompanyUser.user_id == current_user.user_id).first()
        if not co_user or co_user.company_id != company_id:
            raise HTTPException(status_code=403, detail="Not authorized to post to this conversation")
    elif current_user.role == "auditor":
        if audit.auditor_name != current_user.name:
            raise HTTPException(status_code=403, detail="Not authorized to post to this conversation")

    # Check if this is the first message in the conversation
    prev_msg_count = db.query(ChatMessage).filter(ChatMessage.audit_id == audit_id).count()

    # Create message
    msg = ChatMessage(
        audit_id=audit_id,
        sender_id=current_user.user_id,
        sender_name=current_user.name,
        sender_role=current_user.role,
        message_type=message_in.message_type,
        content=message_in.content,
        file_name=message_in.file_name,
        file_size=message_in.file_size,
        status="sent"
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Trigger Notifications
    company = db.query(Company).filter(Company.company_id == company_id).first()
    company_name = company.company_name if company else "Company"

    if current_user.role == "company_user":
        # Notify Auditor
        auditor_user = db.query(User).filter(User.name == audit.auditor_name, User.role == "auditor").first()
        if auditor_user:
            notif = Notification(
                user_id=auditor_user.user_id,
                message=f"New message from {current_user.name} ({company_name}) on Audit #{audit_id}"
            )
            db.add(notif)
            db.commit()
    elif current_user.role == "auditor":
        # Notify Company Users
        co_users = db.query(CompanyUser).filter(CompanyUser.company_id == company_id).all()
        for cu in co_users:
            notif = Notification(
                user_id=cu.user_id,
                message=f"New message from Auditor {current_user.name} on Audit #{audit_id}"
            )
            db.add(notif)
        db.commit()

    # If first message, notify Admins of new conversation
    if prev_msg_count == 0:
        admins = db.query(User).filter(User.role == "admin").all()
        for admin in admins:
            admin_notif = Notification(
                user_id=admin.user_id,
                message=f"New conversation created for Audit #{audit_id} between {company_name} and {audit.auditor_name}"
            )
            db.add(admin_notif)
        db.commit()

    return msg

@router.post("/conversations/{audit_id}/upload")
def upload_file(
    audit_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Check authorization
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admins cannot upload files")

    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    if current_user.role == "company_user":
        co_user = db.query(CompanyUser).filter(CompanyUser.user_id == current_user.user_id).first()
        if not co_user or co_user.company_id != audit.company_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role == "auditor":
        if audit.auditor_name != current_user.name:
            raise HTTPException(status_code=403, detail="Not authorized")

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    upload_dir = "backend/static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    return {
        "file_url": f"/static/uploads/{unique_filename}",
        "file_name": file.filename,
        "file_size": file_size
    }

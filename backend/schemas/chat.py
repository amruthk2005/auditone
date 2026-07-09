from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatMessageBase(BaseModel):
    audit_id: int
    content: str
    message_type: str = "text"
    file_name: Optional[str] = None
    file_size: Optional[int] = None

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    sender_id: int
    sender_name: str
    sender_role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    audit_id: int
    audit_name: str
    audit_status: str
    company_id: int
    company_name: str
    auditor_name: str
    completion_percentage: int
    last_message: Optional[str] = None
    last_updated: Optional[datetime] = None
    unread_count: int
    active: bool

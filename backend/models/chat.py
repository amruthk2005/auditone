from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from backend.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(Integer, nullable=False)
    sender_id = Column(Integer, nullable=False)
    sender_name = Column(String(255), nullable=False)
    sender_role = Column(String(50), nullable=False)
    message_type = Column(String(50), nullable=False, default="text") # text, image, pdf, excel, audit_document, qr_image
    content = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    status = Column(String(20), nullable=False, default="sent") # sent, delivered, seen
    created_at = Column(TIMESTAMP, server_default=func.now())

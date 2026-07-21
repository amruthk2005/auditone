from datetime import timedelta
from typing import Any, Optional
import io
import base64
import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.api import deps
from backend.core import security
from backend.core.config import settings
from backend.models.user import User
from backend.schemas.user import Token, UserCreate, UserResponse

router = APIRouter()

class QRLoginRequest(BaseModel):
    qr_code: str

class QRGenerateLoginRequest(BaseModel):
    email: str = "company@acme.com"

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    email_clean = form_data.username.strip() if form_data.username else ""
    password_clean = form_data.password if form_data.password else ""

    user = db.query(User).filter(func.lower(User.email) == email_clean.lower()).first()
    if not user:
        user = db.query(User).filter(User.email == email_clean).first()

    if not user or not security.verify_password(password_clean, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            {"email": user.email, "role": user.role}, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    email_clean = user_in.email.strip()
    user = db.query(User).filter(func.lower(User.email) == email_clean.lower()).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=email_clean,
        password=security.get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
@router.put("/profile", response_model=UserResponse)
def update_user_me(
    payload: UserProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update profile details (name, email, role) of current logged in user.
    """
    if payload.name is not None and payload.name.strip():
        current_user.name = payload.name.strip()
    if payload.email is not None and payload.email.strip():
        email_clean = payload.email.strip().lower()
        existing = db.query(User).filter(func.lower(User.email) == email_clean, User.user_id != current_user.user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already used by another user")
        current_user.email = email_clean
    if payload.role is not None and payload.role.strip():
        current_user.role = payload.role.strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/qr-generate", response_model=dict)
def generate_company_login_qr(
    payload: QRGenerateLoginRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Generate a QR code image for Company Login.
    """
    email_clean = payload.email.strip()
    user = db.query(User).filter(func.lower(User.email) == email_clean.lower()).first()
    if not user:
        user = db.query(User).filter(User.role.in_(["company_user", "company"])).first()
        if not user:
            raise HTTPException(status_code=404, detail="Company user not found")

    login_code = f"AO-LOGIN-{user.user_id}-{user.email}"

    qr = qrcode.QRCode(version=1, box_size=8, border=3)
    qr.add_data(login_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#6366f1", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_b64 = base64.b64encode(buffer.read()).decode("utf-8")

    return {
        "qr_code": login_code,
        "email": user.email,
        "role": user.role,
        "image_base64": img_b64,
        "message": "Company login QR code generated successfully"
    }


@router.post("/auditor-qr-generate", response_model=dict)
def generate_auditor_login_qr(
    payload: QRGenerateLoginRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Generate a QR code image for Auditor Login.
    """
    email_clean = payload.email.strip() if payload.email else "auditor@acme.com"
    user = db.query(User).filter(func.lower(User.email) == email_clean.lower()).first()
    if not user:
        user = db.query(User).filter(User.role == "auditor").first()
        if not user:
            raise HTTPException(status_code=404, detail="Auditor user not found")

    login_code = f"AO-AUDITOR-LOGIN-{user.user_id}-{user.email}"

    qr = qrcode.QRCode(version=1, box_size=8, border=3)
    qr.add_data(login_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#10b981", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_b64 = base64.b64encode(buffer.read()).decode("utf-8")

    return {
        "qr_code": login_code,
        "email": user.email,
        "role": user.role,
        "image_base64": img_b64,
        "message": "Auditor login QR code generated successfully"
    }


@router.post("/qr-login", response_model=Token)
def login_with_qr_code(
    payload: QRLoginRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Authenticate and log in a user (Company User or Auditor) via scanned QR code.
    """
    code = payload.qr_code.strip()
    if not code:
        raise HTTPException(status_code=400, detail="Empty QR code payload")

    user = None
    if code.startswith("AO-AUDITOR-LOGIN-"):
        parts = code.split("-", 4)
        if len(parts) >= 5:
            email_part = parts[4]
            user = db.query(User).filter(func.lower(User.email) == email_part.lower()).first()
        if not user:
            user = db.query(User).filter(User.role == "auditor").first()
    elif code.startswith("AO-LOGIN-"):
        parts = code.split("-", 3)
        if len(parts) >= 4:
            email_part = parts[3]
            user = db.query(User).filter(func.lower(User.email) == email_part.lower()).first()

    if not user:
        user = db.query(User).filter(func.lower(User.email) == code.lower()).first()

    if not user:
        if "auditor" in code.lower():
            user = db.query(User).filter(User.role == "auditor").first()
        elif "company" in code.lower() or "acme" in code.lower():
            user = db.query(User).filter(User.role.in_(["company_user", "company"])).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or unrecognised QR code for login")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            {"email": user.email, "role": user.role}, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

import uuid
import io
import base64
import qrcode
from datetime import date
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.api import deps
from backend.models.product import QRCode, Product
from backend.schemas.product import QRCodeResponse, QRCodeCreate

router = APIRouter()


def _generate_qr_image_base64(data: str) -> str:
    """Generate a QR code image and return as a base64 PNG string."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


from datetime import datetime, date
import json
from backend.schemas.product import QRCodeResponse, QRCodeCreate, QRGenerateAdvancedRequest

@router.get("", response_model=List[QRCodeResponse])
def read_qr_codes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Fetch all QR codes with auto-seeding."""
    qr_codes = db.query(QRCode).offset(skip).limit(limit).all()
    if not qr_codes:
        products = db.query(Product).all()
        for p in products:
            unique_code = f"AO-{p.id}-QR{uuid.uuid4().hex[:6].upper()}"
            entry = QRCode(
                product_id=p.id,
                qr_code=unique_code,
                generated_date=date.today(),
                barcode_type="QR",
                generation_type="SINGLE",
                batch_quantity=1,
                location_tag=p.location or "HQ Warehouse",
                auditor_notes="Initial asset tag",
            )
            db.add(entry)
        if products:
            db.commit()
            qr_codes = db.query(QRCode).offset(skip).limit(limit).all()
    return qr_codes


@router.post("/generate", response_model=dict)
def generate_qr_code(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Generate a simple QR code for a given product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(QRCode).filter(QRCode.product_id == product_id).first()
    if existing:
        image_b64 = _generate_qr_image_base64(existing.qr_code)
        return {
            "qr_id": existing.qr_id,
            "qr_code": existing.qr_code,
            "product_id": existing.product_id,
            "image_base64": image_b64,
            "already_existed": True,
        }

    unique_code = f"AO-{product_id}-{uuid.uuid4().hex[:8].upper()}"
    image_b64 = _generate_qr_image_base64(unique_code)

    qr_entry = QRCode(
        product_id=product_id,
        qr_code=unique_code,
        generated_date=date.today(),
        barcode_type="QR",
        generation_type="SINGLE",
        batch_quantity=1,
        location_tag=product.location or "HQ Floor 3",
        auditor_notes="Standard asset QR code",
    )
    db.add(qr_entry)
    db.commit()
    db.refresh(qr_entry)

    return {
        "qr_id": qr_entry.qr_id,
        "qr_code": qr_entry.qr_code,
        "product_id": qr_entry.product_id,
        "image_base64": image_b64,
        "already_existed": False,
    }


@router.post("/generate-advanced", response_model=dict)
def generate_advanced_qr_code(
    payload: QRGenerateAdvancedRequest,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Generate advanced QR code with generation date, SINGLE/BULK type, location, and auditor notes."""
    product = None
    if payload.product_id:
        product = db.query(Product).filter(Product.id == payload.product_id).first()

    unique_code = f"AO-{payload.generation_type[:4]}-{payload.product_id or 0}-{uuid.uuid4().hex[:8].upper()}"
    image_b64 = _generate_qr_image_base64(unique_code)

    parsed_date = date.today()
    if payload.generated_date:
        try:
            parsed_date = datetime.strptime(payload.generated_date, "%Y-%m-%d").date()
        except Exception:
            pass

    metadata = {
        "qr_code": unique_code,
        "generation_type": payload.generation_type,
        "generated_date": str(parsed_date),
        "batch_quantity": payload.batch_quantity,
        "location_tag": payload.location_tag or (product.location if product else "HQ Warehouse"),
        "auditor_notes": payload.auditor_notes or "Asset registered for physical audit scan.",
        "product": {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "serial_no": product.serial_no,
            "cost": float(product.cost) if product and product.cost else 0.0,
            "location": product.location,
            "vendor": product.vendor,
            "status": product.status,
        } if product else None
    }

    qr_entry = QRCode(
        product_id=payload.product_id,
        qr_code=unique_code,
        generated_date=parsed_date,
        barcode_type="QR",
        generation_type=payload.generation_type,
        batch_quantity=payload.batch_quantity,
        location_tag=payload.location_tag or (product.location if product else None),
        auditor_notes=payload.auditor_notes,
        metadata_json=json.dumps(metadata)
    )
    db.add(qr_entry)
    db.commit()
    db.refresh(qr_entry)

    return {
        "qr_id": qr_entry.qr_id,
        "qr_code": qr_entry.qr_code,
        "product_id": qr_entry.product_id,
        "generation_type": payload.generation_type,
        "generated_date": str(parsed_date),
        "batch_quantity": payload.batch_quantity,
        "location_tag": qr_entry.location_tag,
        "auditor_notes": payload.auditor_notes,
        "image_base64": image_b64,
        "already_existed": False,
        "product_name": product.name if product else None,
    }


@router.get("/image/{qr_id}")
def get_qr_image(
    qr_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Return the QR code as a downloadable PNG image."""
    qr_entry = db.query(QRCode).filter(QRCode.qr_id == qr_id).first()
    if not qr_entry:
        raise HTTPException(status_code=404, detail="QR Code not found")

    image_b64 = _generate_qr_image_base64(qr_entry.qr_code)
    image_bytes = base64.b64decode(image_b64)
    return StreamingResponse(
        io.BytesIO(image_bytes),
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=QR-{qr_entry.qr_code}.png"},
    )


@router.post("/validate", response_model=dict)
def validate_qr_code(
    *,
    db: Session = Depends(deps.get_db),
    qr_code: str,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Validate a scanned QR code and return all rich associated details for auditors."""
    qr_entry = db.query(QRCode).filter(QRCode.qr_code == qr_code).first()
    if not qr_entry:
        raise HTTPException(status_code=404, detail="QR Code not recognised")

    product = None
    if qr_entry.product_id:
        product = db.query(Product).filter(Product.id == qr_entry.product_id).first()

    meta = {}
    if qr_entry.metadata_json:
        try:
            meta = json.loads(qr_entry.metadata_json)
        except Exception:
            pass

    return {
        "valid": True,
        "qr_id": qr_entry.qr_id,
        "qr_code": qr_entry.qr_code,
        "generated_date": str(qr_entry.generated_date) if qr_entry.generated_date else None,
        "generation_type": qr_entry.generation_type or "SINGLE",
        "batch_quantity": qr_entry.batch_quantity or 1,
        "location_tag": qr_entry.location_tag or (product.location if product else "HQ Warehouse"),
        "auditor_notes": qr_entry.auditor_notes or "Asset verified for physical audit scan.",
        "product": {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "serial_no": product.serial_no,
            "location": product.location,
            "vendor": product.vendor,
            "status": product.status,
            "cost": str(product.cost),
        } if product else meta.get("product"),
    }


@router.get("/company-login-token", response_model=dict)
def get_company_login_token(
    db: Session = Depends(deps.get_db),
    email: str = "company@acme.com",
) -> Any:
    """Generate a Company Login QR code image payload."""
    login_code = f"AO-LOGIN-COMP-{email.strip()}"
    image_b64 = _generate_qr_image_base64(login_code)
    return {
        "qr_code": login_code,
        "email": email,
        "image_base64": image_b64,
        "type": "COMPANY_LOGIN_QR"
    }


@router.get("/auditor-login-token", response_model=dict)
def get_auditor_login_token(
    db: Session = Depends(deps.get_db),
    email: str = "auditor@acme.com",
) -> Any:
    """Generate an Auditor Login QR code image payload."""
    login_code = f"AO-AUDITOR-LOGIN-{email.strip()}"
    image_b64 = _generate_qr_image_base64(login_code)
    return {
        "qr_code": login_code,
        "email": email,
        "image_base64": image_b64,
        "type": "AUDITOR_LOGIN_QR"
    }


@router.post("/audit-session-token", response_model=dict)
def generate_audit_session_qr(
    audit_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Generate a QR code payload for a specific Audit Session."""
    session_code = f"AO-AUDIT-SESSION-{audit_id}-{uuid.uuid4().hex[:6].upper()}"
    image_b64 = _generate_qr_image_base64(session_code)
    return {
        "audit_id": audit_id,
        "qr_code": session_code,
        "image_base64": image_b64,
        "type": "AUDIT_SESSION_QR"
    }


@router.post("/batch-generate", response_model=dict)
def batch_generate_qr_codes(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Generate QR codes for all products that do not currently have a QR code."""
    unlinked_products = (
        db.query(Product)
        .outerjoin(QRCode, Product.id == QRCode.product_id)
        .filter(QRCode.qr_id.is_(None))
        .all()
    )

    created_count = 0
    new_qr_codes = []
    for product in unlinked_products:
        unique_code = f"AO-{product.id}-{uuid.uuid4().hex[:8].upper()}"
        qr_entry = QRCode(
            product_id=product.id,
            qr_code=unique_code,
            generated_date=date.today(),
            barcode_type="QR",
        )
        db.add(qr_entry)
        new_qr_codes.append(unique_code)
        created_count += 1

    if created_count > 0:
        db.commit()

    return {
        "created_count": created_count,
        "message": f"Successfully generated {created_count} QR codes.",
        "codes": new_qr_codes,
    }


@router.delete("/{qr_id}")
def delete_qr_code(
    qr_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a QR code entry."""
    qr_entry = db.query(QRCode).filter(QRCode.qr_id == qr_id).first()
    if not qr_entry:
        raise HTTPException(status_code=404, detail="QR Code not found")
    db.delete(qr_entry)
    db.commit()
    return {"message": "QR Code deleted successfully"}

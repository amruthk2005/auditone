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


@router.get("", response_model=List[QRCodeResponse])
def read_qr_codes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Fetch all QR codes."""
    qr_codes = db.query(QRCode).offset(skip).limit(limit).all()
    return qr_codes


@router.post("/generate", response_model=dict)
def generate_qr_code(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """Generate a QR code for a given product. Returns the QR as a base64 image."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if a QR already exists for this product
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
    """Validate a scanned QR code and return the associated product details."""
    qr_entry = db.query(QRCode).filter(QRCode.qr_code == qr_code).first()
    if not qr_entry:
        raise HTTPException(status_code=404, detail="QR Code not recognised")

    product = None
    if qr_entry.product_id:
        product = db.query(Product).filter(Product.id == qr_entry.product_id).first()

    return {
        "valid": True,
        "qr_id": qr_entry.qr_id,
        "qr_code": qr_entry.qr_code,
        "product": {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "serial_no": product.serial_no,
            "location": product.location,
            "status": product.status,
            "cost": str(product.cost),
        } if product else None,
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

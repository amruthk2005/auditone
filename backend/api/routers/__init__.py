from fastapi import APIRouter
from backend.api.routers import auth, companies, products, audits, finance, dashboard, notifications, departments, vendors, qr, chat

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(vendors.router, prefix="/vendors", tags=["vendors"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(qr.router, prefix="/qr", tags=["qr"])
api_router.include_router(audits.router, prefix="/audits", tags=["audits"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])


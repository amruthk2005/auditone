from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.database import engine, Base
from backend.models import user, company, product, audit, finance, notification

Base.metadata.create_all(bind=engine)

# Ensure demo users exist in DB automatically
try:
    from backend.database import SessionLocal
    from backend.models.user import User
    from backend.core.security import get_password_hash
    db = SessionLocal()
    demo_users = [
        {"name": "Admin User", "email": "admin@acme.com", "password": "demo", "role": "admin"},
        {"name": "Alice Johnson", "email": "company@acme.com", "password": "demo", "role": "company_user"},
        {"name": "Bob Smith", "email": "auditor@acme.com", "password": "demo", "role": "auditor"},
    ]
    for u in demo_users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_user = User(
                name=u["name"],
                email=u["email"],
                password=get_password_hash(u["password"]),
                role=u["role"],
            )
            db.add(new_user)
    db.commit()
    db.close()
except Exception as e:
    print(f"Auto-seed warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this should be specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to Auditone API"}

from backend.api.routers import api_router

app.include_router(api_router, prefix=settings.API_V1_STR)

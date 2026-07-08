import os
import sys

# Add project root to sys.path so backend module can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal
from backend.models.user import User
from backend.core.security import get_password_hash

DEMO_USERS = [
    {
        "name": "Admin User",
        "email": "admin@acme.com",
        "password": "demo",
        "role": "admin",
    },
    {
        "name": "Alice Johnson",
        "email": "company@acme.com",
        "password": "demo",
        "role": "company_user",
    },
    {
        "name": "Bob Smith",
        "email": "auditor@acme.com",
        "password": "demo",
        "role": "auditor",
    },
]

def seed_db():
    db = SessionLocal()
    try:
        for u in DEMO_USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                print(f"Seeding {u['email']}...")
                new_user = User(
                    name=u["name"],
                    email=u["email"],
                    password=get_password_hash(u["password"]),
                    role=u["role"],
                )
                db.add(new_user)
                db.commit()
                print(f"  [OK] Created {u['email']} (role={u['role']})")
            else:
                print(f"  [--] {u['email']} already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

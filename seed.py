import os
import sys

# Add project root to sys.path so backend module can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal
from backend.models.user import User
from backend.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@acme.com").first()
        if not user:
            print("Seeding admin@acme.com...")
            admin_user = User(
                name="Admin User",
                email="admin@acme.com",
                password=get_password_hash("demo"),
                role="Admin"
            )
            db.add(admin_user)
            db.commit()
            print("Successfully seeded admin user!")
        else:
            print("Admin user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

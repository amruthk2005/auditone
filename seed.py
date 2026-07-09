import os
import sys

# Add project root to sys.path so backend module can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal, Base, engine
from backend.models.user import User, CompanyUser
from backend.models.company import Company
from backend.models.audit import Audit
from backend.models.finance import FinanceRecord, Depreciation, Valuation
from backend.models.notification import Notification
from backend.models.chat import ChatMessage
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

DEMO_COMPANIES = [
    {"company_id": 1, "company_name": "Acme Corp", "company_type": "Manufacturing"},
    {"company_id": 2, "company_name": "Globex Solutions", "company_type": "Technology"},
    {"company_id": 3, "company_name": "Initech", "company_type": "Finance"},
    {"company_id": 4, "company_name": "Umbrella Ltd", "company_type": "Retail"},
]

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Companies
        for c in DEMO_COMPANIES:
            existing = db.query(Company).filter(Company.company_id == c["company_id"]).first()
            if not existing:
                print(f"Seeding company {c['company_name']}...")
                company = Company(
                    company_id=c["company_id"],
                    company_name=c["company_name"],
                    company_type=c["company_type"]
                )
                db.add(company)
        db.commit()

        # 2. Seed Users
        user_map = {}
        for u in DEMO_USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                print(f"Seeding user {u['email']}...")
                new_user = User(
                    name=u["name"],
                    email=u["email"],
                    password=get_password_hash(u["password"]),
                    role=u["role"],
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                user_map[u["email"]] = new_user.user_id
                print(f"  [OK] Created {u['email']} (role={u['role']})")
            else:
                print(f"  [--] {u['email']} already exists.")
                user_map[u["email"]] = existing.user_id

        # 3. Seed CompanyUser link for Alice (company@acme.com) to Acme Corp (1)
        company_user_email = "company@acme.com"
        alice_id = user_map.get(company_user_email)
        if alice_id:
            link = db.query(CompanyUser).filter(CompanyUser.user_id == alice_id).first()
            if not link:
                print("Linking company@acme.com to Acme Corp...")
                new_link = CompanyUser(user_id=alice_id, company_id=1)
                db.add(new_link)
                db.commit()

        # 4. Seed Audits
        demo_audits = [
            {
                "id": 1,
                "company_id": 1,
                "type": "Warehouse Q1 Audit",
                "audit_date": "2026-03-15",
                "auditor_name": "Bob Smith",
                "scope": "Warehouse A",
                "status": "In Progress"
            },
            {
                "id": 2,
                "company_id": 1,
                "type": "Office Inventory Check",
                "audit_date": "2026-04-10",
                "auditor_name": "Bob Smith",
                "scope": "HQ Floor 3",
                "status": "Scheduled"
            }
        ]
        import datetime
        for a in demo_audits:
            existing = db.query(Audit).filter(Audit.id == a["id"]).first()
            if not existing:
                print(f"Seeding audit {a['type']}...")
                audit_date = datetime.datetime.strptime(a["audit_date"], "%Y-%m-%d").date()
                new_audit = Audit(
                    id=a["id"],
                    company_id=a["company_id"],
                    type=a["type"],
                    audit_date=audit_date,
                    auditor_name=a["auditor_name"],
                    scope=a["scope"],
                    status=a["status"]
                )
                db.add(new_audit)
        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

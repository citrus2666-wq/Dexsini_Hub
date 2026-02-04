from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

admin = db.query(User).filter(User.email == "admin@dexsini.com").first()

if not admin:
    print("Admin user not found")
    exit()

admin.password_hash = get_password_hash("Admin@123")
db.commit()

print("✅ Admin password reset successfully")

import sys
import os

# Add the current directory to sys.path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
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

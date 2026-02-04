import sys
import os

# Add the current directory to sys.path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import get_password_hash
from app.core.database import SessionLocal
from app.models.user import User

def reset_password():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@dexsini.com").first()

        if admin:
            admin.password_hash = get_password_hash("Admin@123")
            db.commit()
            print("Admin password reset successfully")
        else:
            print("Admin user not found")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_password()

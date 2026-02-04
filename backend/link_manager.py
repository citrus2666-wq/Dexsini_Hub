from app.core.database import SessionLocal
from sqlalchemy import text

def link_users():
    db = SessionLocal()
    try:
        # We assume:
        # User ID 1 = Admin / Your current login
        # User ID 3 = The employee who applied (based on logs)
        
        print("Linking User ID 3 to report to Manager ID 1...")
        
        # SQL Update
        db.execute(text("UPDATE users SET manager_id = 1 WHERE id = 3;"))
        db.commit()
        
        print("✅ Success! User 3 now reports to User 1.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    link_users()

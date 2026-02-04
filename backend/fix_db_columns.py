from sqlalchemy import create_engine, text
from app.core.config import settings
import time

def fix_database():
    print("--------------------------------------------------")
    print("🔧 STARTING DATABASE REPAIR")
    print(f"Target DB: {settings.POSTGRES_DB}")
    print("--------------------------------------------------")
    
    engine = create_engine(settings.DATABASE_URI)
    
    with engine.connect() as conn:
        # 1. Fix DOB
        try:
            print("1. Checking 'dob' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE"))
            conn.commit()
            print("   ✅ 'dob' column ensured.")
        except Exception as e:
            print(f"   ❌ Error adding 'dob': {e}")
            
        # 2. Fix Phone Number
        try:
            print("2. Checking 'phone_number' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR"))
            conn.commit()
            print("   ✅ 'phone_number' column ensured.")
        except Exception as e:
            print(f"   ❌ Error adding 'phone_number': {e}")

        # 3. Fix Join Date
        try:
            print("3. Checking 'join_date' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date DATE"))
            conn.commit()
            print("   ✅ 'join_date' column ensured.")
        except Exception as e:
            print(f"   ❌ Error adding 'join_date': {e}")
            
    print("--------------------------------------------------")
    print("✨ REPAIR COMPLETE")
    print("Please restart your backend server if it is running.")
    print("--------------------------------------------------")

if __name__ == "__main__":
    fix_database()

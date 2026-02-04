from app.core.database import SessionLocal
from sqlalchemy import text

def reset_leave_types():
    db = SessionLocal()
    try:
        print("1. Truncating table...")
        # TRUNCATE + RESET ID
        db.execute(text("TRUNCATE TABLE leave_types RESTART IDENTITY CASCADE;"))
        
        print("2. Inserting types...")
        # INSERT fixed leave types
        db.execute(text("""
            INSERT INTO leave_types (name, default_days_per_year, carry_forward, color_hex)
            VALUES
            ('Sick Leave', 12, false, '#FF6B6B'),
            ('Week Off', 104, false, '#4ECDC4'),
            ('Annual Leave', 20, true, '#1A535C'),
            ('Leave in OT', 0, false, '#FFA500'),
            ('Work From Home', 365, false, '#5F27CD');
        """))

        db.commit()
        print("✅ Leave types reset successfully!")

    except Exception as e:
        db.rollback()
        print("❌ Error resetting leave types:", e)
    finally:
        db.close()

if __name__ == "__main__":
    reset_leave_types()

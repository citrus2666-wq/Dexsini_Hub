from app.core.database import SessionLocal
from app.models.leave import LeaveType

def check_leave_types():
    db = SessionLocal()
    try:
        types = db.query(LeaveType).all()
        print(f"Found {len(types)} leave types in database:")
        for t in types:
            print(f"- {t.id}: {t.name} ({t.default_days_per_year} days)")
    except Exception as e:
        print(f"Error checking DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_leave_types()

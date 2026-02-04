import sys
import os
from datetime import date, time
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from app.models.ot import OTRequest, OTStatus

def test_cascade_deletion():
    print("Starting test_cascade_deletion...")
    db = SessionLocal()
    test_email = "temp_test_user@example.com"
    
    try:
        # 1. Cleanup if exists from previous failed run
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()
            print("Cleaned up existing test user.")

        # 2. Create a test user
        user = User(
            email=test_email,
            password_hash="fake_hash",
            full_name="Temp Test User",
            role=UserRole.EMPLOYEE,
            is_active=True
        )
        db.add(user)
        db.flush() # Get user.id
        print(f"Created test user: {user.id}")

        # 3. Get a leave type
        lt = db.query(LeaveType).first()
        if not lt:
            print("No leave types found, creating one...")
            lt = LeaveType(name="Generic", default_days_per_year=10, color_hex="#000000")
            db.add(lt)
            db.flush()

        # 4. Create a leave request
        lr = LeaveRequest(
            user_id=user.id,
            leave_type_id=lt.id,
            start_date=date(2026, 3, 1),
            end_date=date(2026, 3, 5),
            total_days=5.0,
            status=LeaveStatus.PENDING,
            reason="Test Reason"
        )
        db.add(lr)
        
        # 5. Create an OT request
        otr = OTRequest(
            user_id=user.id,
            ot_date=date(2026, 3, 1),
            start_time=time(18, 0),
            end_time=time(20, 0),
            total_hours=2.0,
            status=OTStatus.PENDING,
            reason="Test OT"
        )
        db.add(otr)
        db.commit()
        print("Created dependent leave and OT requests.")

        # 6. Attempt Deletion
        print(f"Attempting to delete user {user.id}...")
        db.delete(user)
        db.commit()
        print("User deleted successfully!")

        # 7. Verify dependents are gone
        lr_check = db.query(LeaveRequest).filter(LeaveRequest.user_id == user.id).first()
        otr_check = db.query(OTRequest).filter(OTRequest.user_id == user.id).first()
        
        if not lr_check and not otr_check:
            print("SUCCESS: Dependent records also deleted (Cascade works).")
        else:
            print("FAILURE: Dependent records still exist or check failed.")
            if lr_check: print("  Leave record still exists.")
            if otr_check: print("  OT record still exists.")

    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_cascade_deletion()

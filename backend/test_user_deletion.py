import sys
import os
from datetime import date, time
# Add backend to path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from app.models.ot import OTRequest, OTStatus

def test_user_deletion():
    print("--- Starting User Deletion Test ---")
    db = SessionLocal()
    test_email = "cleanup_test_user@dexsini.com"
    
    try:
        # 1. Cleanup any leftover test data
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            print(f"Cleaning up existing user: {test_email}")
            db.delete(existing)
            db.commit()

        # 2. Create a test user
        print(f"Creating test user: {test_email}")
        user = User(
            email=test_email,
            password_hash="test_hash",
            full_name="Cleanup Test User",
            role=UserRole.EMPLOYEE,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id
        print(f"User created with ID: {user_id}")

        # 3. Get or create a Leave Type
        lt = db.query(LeaveType).first()
        if not lt:
            print("Creating a temporary Leave Type...")
            lt = LeaveType(name="Test Leave", default_days_per_year=10, color_hex="#3b82f6")
            db.add(lt)
            db.commit()
            db.refresh(lt)

        # 4. Create dependent Leave Request
        print("Creating dependent Leave Request...")
        lr = LeaveRequest(
            user_id=user_id,
            leave_type_id=lt.id,
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 3),
            total_days=3.0,
            status=LeaveStatus.PENDING,
            reason="Deletion Test"
        )
        db.add(lr)

        # 5. Create dependent OT Request
        print("Creating dependent OT Request...")
        otr = OTRequest(
            user_id=user_id,
            ot_date=date(2026, 1, 1),
            start_time=time(18, 0),
            end_time=time(20, 0),
            total_hours=2.0,
            status=OTStatus.PENDING,
            reason="Deletion Test OT"
        )
        db.add(otr)
        db.commit()

        # Verify requests exist
        lr_id = lr.id
        otr_id = otr.id
        print(f"Leave Request ID: {lr_id}, OT Request ID: {otr_id}")

        # 6. Delete the User
        print(f"Executing deletion of User {user_id}...")
        db.delete(user)
        db.commit()
        print("User deleted successfully!")

        # 7. Verify cascading deletion
        lr_check = db.query(LeaveRequest).filter(LeaveRequest.id == lr_id).first()
        otr_check = db.query(OTRequest).filter(OTRequest.id == otr_id).first()

        if lr_check is None and otr_check is None:
            print("SUCCESS: All dependent records were cascaded and deleted.")
        else:
            print("FAILURE: Some dependent records still exist!")
            if lr_check: print(f" - Leave Request {lr_id} still exists.")
            if otr_check: print(f" - OT Request {otr_id} still exists.")

    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
    finally:
        db.close()
        print("--- Test Finished ---")

if __name__ == "__main__":
    test_user_deletion()

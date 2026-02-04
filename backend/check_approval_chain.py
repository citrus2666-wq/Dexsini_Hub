from app.core.database import SessionLocal
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveStatus
from sqlalchemy.orm import joinedload

def check_chain():
    db = SessionLocal()
    try:
        print("\n--- 1. USERS & MANAGERS ---")
        users = db.query(User).options(joinedload(User.manager)).all()
        for u in users:
            manager_name = u.manager.full_name if u.manager else "None"
            print(f"User: {u.full_name} (ID: {u.id}, Role: {u.role}) -> Manager: {manager_name} (ID: {u.manager_id})")

        print("\n--- 2. PENDING LEAVE REQUESTS ---")
        leaves = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).all()
        if not leaves:
            print("No PENDING leaves found.")
        for l in leaves:
            print(f"Leave ID: {l.id} by User ID: {l.user_id} ({l.user.full_name})")
            print(f"   -> Required Approver (Manager ID): {l.user.manager_id}")
            if l.user.manager_id is None:
                print("   ⚠️  WARNING: This user has NO manager assigned. Request skips to Admin.")

    finally:
        db.close()

if __name__ == "__main__":
    check_chain()

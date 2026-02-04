import logging
import sys
from sqlalchemy import text
from app.core.database import SessionLocal, engine
from app.models.leave import LeaveType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_and_seed_leave_types() -> None:
    db = SessionLocal()
    try:
        # 1. Truncate table and reset identity (IDs start from 1)
        # Note: CASCADE is needed because leave_requests reference leave_types.
        # This acts as a hard reset.
        print("1. Connecting to DB...")
        # 1. Truncate table and reset identity (IDs start from 1)
        # Note: CASCADE is needed because leave_requests reference leave_types.
        # This acts as a hard reset.
        print("2. Truncating leave_types table...")
        db.execute(text("TRUNCATE TABLE leave_types RESTART IDENTITY CASCADE;"))
        db.commit()
        print("3. Truncate successful.")

        # 2. Insert Types in specific order (ID 1, 2, 3...)
        types = [
             {
                "name": "Sick Leave",
                "default_days_per_year": 12,
                "carry_forward": False,
                "color_hex": "#FFAB00"  # Amber
            },
            {
                "name": "Week Off",
                "default_days_per_year": 104, 
                "carry_forward": False,
                "color_hex": "#2962FF"  # Blue
            },
            {
                "name": "Annual Leave",
                "default_days_per_year": 20,
                "carry_forward": True,
                "color_hex": "#00C853"  # Green
            },
            {
                "name": "Leave in OT",
                "default_days_per_year": 0,
                "carry_forward": False,
                "color_hex": "#AA00FF"  # Purple
            },
            {
                "name": "Work From Home",
                "default_days_per_year": 365,
                "carry_forward": False,
                "color_hex": "#00E5FF"  # Cyan
            }
        ]

        print("4. Seeding new leave types...")
        for t in types:
            new_type = LeaveType(
                name=t["name"],
                default_days_per_year=t["default_days_per_year"],
                carry_forward=t["carry_forward"],
                color_hex=t["color_hex"]
            )
            db.add(new_type)
        
        db.commit()
        print("5. Successfully reset and seeded leave types!")

    except Exception as e:
        logger.error(f"Error resetting DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed_leave_types()

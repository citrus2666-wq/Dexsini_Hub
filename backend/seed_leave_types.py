import logging
import sys
from app.core.database import SessionLocal
from app.models.leave import LeaveType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_leave_types() -> None:
    db = SessionLocal()
    try:
        types = [
            {
                "name": "Sick Leave",
                "default_days_per_year": 12,
                "carry_forward": False,
                "color_hex": "#FFAB00"  # Amber
            },
            {
                "name": "Week Off",
                "default_days_per_year": 104, # approx 2 days a week
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
                "name": "Leave in OT", # Compensatory Off
                "default_days_per_year": 0,
                "carry_forward": False,
                "color_hex": "#AA00FF"  # Purple
            },
            {
                "name": "Work From Home",
                "default_days_per_year": 365, # Flexible
                "carry_forward": False,
                "color_hex": "#00E5FF"  # Cyan
            }
        ]

        for t in types:
            exists = db.query(LeaveType).filter(LeaveType.name == t["name"]).first()
            if not exists:
                new_type = LeaveType(
                    name=t["name"],
                    default_days_per_year=t["default_days_per_year"],
                    carry_forward=t["carry_forward"],
                    color_hex=t["color_hex"]
                )
                db.add(new_type)
                logger.info(f"Created leave type: {t['name']}")
            else:
                logger.info(f"Leave type already exists: {t['name']}")
                # Optional: Update existing if values changed (not strictly needed unless user wants to force update)
        
        db.commit()

    except Exception as e:
        logger.error(f"Error seeding leave types: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Seeding Leave Types...")
    seed_leave_types()
    logger.info("Done.")

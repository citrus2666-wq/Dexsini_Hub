import logging
import sys
from app.core.database import SessionLocal
from app.models.leave import LeaveType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_leave_types():
    db = SessionLocal()
    try:
        types = [
            {"name": "Sick Leave", "default_days_per_year": 12, "color_hex": "#ff0055", "carry_forward": False},
            {"name": "Casual Leave", "default_days_per_year": 12, "color_hex": "#00f0ff", "carry_forward": False},
            {"name": "Privilege Leave", "default_days_per_year": 18, "color_hex": "#7000ff", "carry_forward": True},
        ]
        
        for t in types:
            exists = db.query(LeaveType).filter(LeaveType.name == t["name"]).first()
            if not exists:
                db_obj = LeaveType(**t)
                db.add(db_obj)
                logger.info(f"Created Leave Type: {t['name']}")
        
        db.commit()
    except Exception as e:
        logger.error(f"Error seeding leave types: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_leave_types()

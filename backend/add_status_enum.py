from app.core.database import SessionLocal
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_enum():
    db = SessionLocal()
    try:
        # Postgres specific command to add value to ENUM
        logger.info("Adding 'PENDING_ADMIN' to leavestatus enum...")
        
        # We catch error in case it already exists
        try:
            db.execute(text("ALTER TYPE leavestatus ADD VALUE 'PENDING_ADMIN';"))
            db.commit()
            logger.info("Successfully added PENDING_ADMIN.")
        except Exception as e:
            logger.info(f"Could not add value (might already exist): {e}")
            db.rollback()

    except Exception as e:
        logger.error(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_enum()

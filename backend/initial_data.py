import logging
import sys
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@dexsini.com").first()
        if not user:
            user = User(
                email="admin@dexsini.com",
                password_hash=get_password_hash("Admin@123"),
                full_name="Super Admin",
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(user)
            db.commit()
            logger.info("Admin user created: admin@dexsini.com / Admin@123")
        else:
            user.password_hash = get_password_hash("Admin@123")
            db.commit()
            logger.info("Admin user already exists - Password reset to: Admin@123")
    except Exception as e:
        logger.error(f"Error creating initial data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")

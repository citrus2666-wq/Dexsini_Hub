import logging
import sys
import os

# Add the current directory to sys.path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveType, Holiday
from app.models.ot import OTRequest
from initial_data import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Connecting to database...")
    try:
        # Create all tables
        logger.info("Creating tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully.")
        
        # Initialize default admin user
        logger.info("Initializing initial data...")
        init_db()
        logger.info("Database initialization complete.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

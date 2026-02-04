import sys
import os
sys.path.append(os.getcwd())
from app.core.database import engine
from sqlalchemy import text

def test_db():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Database Connection Successful!")
            print(result.fetchone())
    except Exception as e:
        print(f"Database Connection Failed: {e}")

if __name__ == "__main__":
    test_db()

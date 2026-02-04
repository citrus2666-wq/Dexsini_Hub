from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate_db():
    print(f"Connecting to DB: {settings.POSTGRES_DB} on {settings.POSTGRES_SERVER}")
    engine = create_engine(settings.DATABASE_URI)
    
    with engine.connect() as conn:
        try:
            # Check if column exists
            print("Attempting to add 'dob' column to 'users' table...")
            conn.execute(text("ALTER TABLE users ADD COLUMN dob DATE"))
            conn.commit()
            print("Success: Column 'dob' added.")
        except Exception as e:
            print(f"Migration Result: {e}")
            print("(This likely means the column already exists or there was a connection error)")

if __name__ == "__main__":
    migrate_db()

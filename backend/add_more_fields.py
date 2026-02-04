from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate_db():
    print(f"Connecting to DB: {settings.POSTGRES_DB} on {settings.POSTGRES_SERVER}")
    engine = create_engine(settings.DATABASE_URI)
    
    with engine.connect() as conn:
        try:
            # Phone Number
            print("Attempting to add 'phone_number' column to 'users' table...")
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR"))
                print("Success: Column 'phone_number' added.")
            except Exception as e:
                print(f"Skipping phone_number: {e}")
            
            # Join Date
            print("Attempting to add 'join_date' column to 'users' table...")
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN join_date DATE"))
                print("Success: Column 'join_date' added.")
            except Exception as e:
                print(f"Skipping join_date: {e}")

            conn.commit()
            
        except Exception as e:
            print(f"Migration Error: {e}")

if __name__ == "__main__":
    migrate_db()

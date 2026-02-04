import sys
from app.core.database import SessionLocal
from app.repositories.user import user_repository
from app.schemas.user import User as UserSchema

def debug_users():
    db = SessionLocal()
    try:
        users = user_repository.get_multi(db)
        print(f"Found {len(users)} users in DB (ORM objects).")
        
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
            try:
                # Try to validate with Pydantic
                schema_user = UserSchema.model_validate(u)
                print(f"  [OK] Pydantic Validation Passed for User {u.id}")
            except Exception as e:
                print(f"  [ERROR] Pydantic Validation FAILED for User {u.id}: {e}")
                
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_users()

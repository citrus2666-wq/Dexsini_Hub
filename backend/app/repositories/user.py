from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

class UserRepository:
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get(self, db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()
    
    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    def get_by_manager(self, db: Session, manager_id: int, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).filter(User.manager_id == manager_id).offset(skip).limit(limit).all()

    def create(self, db: Session, user_in: UserCreate) -> User:
        db_obj = User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role,
            designation=user_in.designation,
            dob=user_in.dob,
            phone_number=user_in.phone_number,
            join_date=user_in.join_date,
            manager_id=user_in.manager_id,
            is_active=user_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, *, db_obj: User, obj_in: UserUpdate) -> User:
        update_data = obj_in.dict(exclude_unset=True)
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password_hash"] = hashed_password
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def remove(self, db: Session, *, id: int) -> User:
        obj = db.query(User).get(id)
        db.delete(obj)
        db.commit()
        return obj

user_repository = UserRepository()

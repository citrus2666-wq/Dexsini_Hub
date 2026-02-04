from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from datetime import datetime, date

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.EMPLOYEE
    designation: Optional[str] = None
    dob: Optional[date] = None
    phone_number: Optional[str] = None
    join_date: Optional[date] = None
    is_active: Optional[bool] = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    manager_id: Optional[int] = None

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    designation: Optional[str] = None
    dob: Optional[date] = None
    phone_number: Optional[str] = None
    join_date: Optional[date] = None
    manager_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserInDBBase(UserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    password_hash: str

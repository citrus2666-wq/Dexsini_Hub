from typing import Optional, List
from pydantic import BaseModel
from datetime import date, datetime
from app.models.leave import LeaveStatus, HolidayType

# --- LEAVE TYPES ---
class LeaveTypeBase(BaseModel):
    name: str
    default_days_per_year: int
    carry_forward: bool = False
    color_hex: str

class LeaveTypeCreate(LeaveTypeBase):
    pass

class LeaveTypeUpdate(LeaveTypeBase):
    pass

class LeaveType(LeaveTypeBase):
    id: int

    class Config:
        from_attributes = True

# --- LEAVE REQUESTS ---
class LeaveRequestBase(BaseModel):
    leave_type_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    status: LeaveStatus
    manager_comment: Optional[str] = None

# Minimal user info for leave display
class UserMini(BaseModel):
    id: int
    full_name: str
    email: str
    
    class Config:
        from_attributes = True

class LeaveRequest(LeaveRequestBase):
    id: int
    user_id: int
    total_days: float
    status: LeaveStatus
    manager_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    user: Optional[UserMini] = None

    class Config:
        from_attributes = True

# --- HOLIDAYS ---
class HolidayBase(BaseModel):
    date: date
    name: str
    type: HolidayType = HolidayType.PUBLIC
    is_recurring: bool = True

class HolidayCreate(HolidayBase):
    pass

class Holiday(HolidayBase):
    id: int

    class Config:
        from_attributes = True

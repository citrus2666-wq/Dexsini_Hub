from typing import Optional
from pydantic import BaseModel
from datetime import date, time, datetime
from app.models.ot import OTStatus
from app.schemas.user import User as UserSchema

# Minimal user info for display
class UserMini(BaseModel):
    id: int
    full_name: str
    email: str
    
    class Config:
        from_attributes = True

class OTRequestBase(BaseModel):
    ot_date: date
    start_time: time
    end_time: time
    reason: str

class OTRequestCreate(OTRequestBase):
    pass

class OTRequestUpdate(BaseModel):
    status: OTStatus
    manager_comment: Optional[str] = None

class OTRequest(OTRequestBase):
    id: int
    user_id: int
    total_hours: float
    status: OTStatus
    manager_comment: Optional[str] = None
    created_at: datetime
    
    user: Optional[UserMini] = None

    class Config:
        from_attributes = True

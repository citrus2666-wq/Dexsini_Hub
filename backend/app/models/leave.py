from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Date, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    PENDING_ADMIN = "PENDING_ADMIN"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class HolidayType(str, enum.Enum):
    PUBLIC = "PUBLIC"
    OPTIONAL = "OPTIONAL"

class LeaveType(Base):
    __tablename__ = "leave_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    default_days_per_year = Column(Integer, nullable=False)
    carry_forward = Column(Boolean, default=False)
    color_hex = Column(String, nullable=False)

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    leave_type_id = Column(Integer, ForeignKey("leave_types.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Float, nullable=False)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING)
    reason = Column(Text)
    manager_comment = Column(Text)
    approver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", foreign_keys=[user_id], back_populates="leave_requests")
    leave_type = relationship("LeaveType")
    approver = relationship("User", foreign_keys=[approver_id])

class Holiday(Base):
    __tablename__ = "holidays"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(HolidayType), default=HolidayType.PUBLIC)
    is_recurring = Column(Boolean, default=True)

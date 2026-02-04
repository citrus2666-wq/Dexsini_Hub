from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    designation = Column(String)
    dob = Column(Date, nullable=True)
    phone_number = Column(String, nullable=True)
    join_date = Column(Date, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    manager = relationship("User", remote_side=[id], backref="subordinates")
    leave_requests = relationship("LeaveRequest", back_populates="user", cascade="all, delete-orphan", foreign_keys="LeaveRequest.user_id")
    ot_requests = relationship("OTRequest", back_populates="user", cascade="all, delete-orphan", foreign_keys="OTRequest.user_id")

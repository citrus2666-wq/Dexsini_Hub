from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Date, Time, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class OTStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class OTRequest(Base):
    __tablename__ = "overtime_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ot_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    total_hours = Column(Float, nullable=False)
    status = Column(Enum(OTStatus), default=OTStatus.PENDING)
    reason = Column(Text, nullable=False)
    manager_comment = Column(Text)
    approver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", foreign_keys=[user_id], back_populates="ot_requests")
    approver = relationship("User", foreign_keys=[approver_id])

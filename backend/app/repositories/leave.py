from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.leave import LeaveRequest, LeaveType, Holiday, LeaveStatus
from app.schemas.leave import LeaveRequestCreate, LeaveTypeCreate, HolidayCreate, LeaveRequestUpdate
from datetime import date

class LeaveRepository:
    # --- LEAVE TYPES ---
    def get_leave_types(self, db: Session) -> List[LeaveType]:
        return db.query(LeaveType).all()

    def create_leave_type(self, db: Session, obj_in: LeaveTypeCreate) -> LeaveType:
        db_obj = LeaveType(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    # --- LEAVE REQUESTS ---
    def create_leave_request(self, db: Session, obj_in: LeaveRequestCreate, user_id: int, total_days: float) -> LeaveRequest:
        db_obj = LeaveRequest(
            **obj_in.dict(),
            user_id=user_id,
            total_days=total_days
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_leave_requests(self, db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[LeaveRequest]:
        query = db.query(LeaveRequest)
        if user_id:
            query = query.filter(LeaveRequest.user_id == user_id)
        return query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()

    def get_leave_request(self, db: Session, id: int) -> Optional[LeaveRequest]:
        return db.query(LeaveRequest).filter(LeaveRequest.id == id).first()

    def get_pending_approvals(self, db: Session, manager_id: int, is_admin: bool = False, skip: int = 0, limit: int = 100) -> List[LeaveRequest]:
        from app.models.user import User
        from sqlalchemy import or_, and_

        if is_admin:
            # Admin can now see ALL pending requests (since they can approve any)
            # We keep PENDING_ADMIN check just in case legacy rows exist with that status
            return db.query(LeaveRequest).filter(
                or_(
                    LeaveRequest.status == LeaveStatus.PENDING,
                    LeaveRequest.status == LeaveStatus.PENDING_ADMIN
                )
            ).order_by(LeaveRequest.created_at.asc()).offset(skip).limit(limit).all()
        else:
            # Manager sees only their direct reports' pending requests (PENDING)
            return db.query(LeaveRequest).join(LeaveRequest.user).filter(
                LeaveRequest.status == LeaveStatus.PENDING,
                User.manager_id == manager_id
            ).order_by(LeaveRequest.created_at.asc()).offset(skip).limit(limit).all()

    def update_leave_status(self, db: Session, db_obj: LeaveRequest, obj_in: LeaveRequestUpdate, approver_id: int) -> LeaveRequest:
        db_obj.status = obj_in.status
        db_obj.manager_comment = obj_in.manager_comment
        db_obj.approver_id = approver_id
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    # --- HOLIDAYS ---
    def get_holidays(self, db: Session) -> List[Holiday]:
        return db.query(Holiday).order_by(Holiday.date).all()

    def create_holiday(self, db: Session, obj_in: HolidayCreate) -> Holiday:
        db_obj = Holiday(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

leave_repository = LeaveRepository()

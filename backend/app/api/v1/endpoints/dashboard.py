from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.api import deps
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.ot import OTRequest, OTStatus

router = APIRouter()

@router.get("/stats", response_model=Dict[str, int])
def read_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Get dashboard statistics.
    """
    # If Admin, show global stats
    if current_user.role == "ADMIN":
        total_employees = db.query(User).count()
        pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).count()
        pending_ot = db.query(OTRequest).filter(OTRequest.status == OTStatus.PENDING).count()
        
        today = date.today()
        on_leave_today = db.query(LeaveRequest).filter(
            LeaveRequest.status == LeaveStatus.APPROVED,
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today
        ).count()
        
        return {
            "total_employees": total_employees,
            "pending_leaves": pending_leaves,
            "pending_ot": pending_ot,
            "on_leave_today": on_leave_today
        }
    
    # If Manager, show team stats
    else:
        # My Team Count
        my_team_count = db.query(User).filter(User.manager_id == current_user.id).count()
        
        # Pending Leaves (Only from my team)
        pending_leaves = db.query(LeaveRequest).join(LeaveRequest.user).filter(
            User.manager_id == current_user.id,
            LeaveRequest.status == LeaveStatus.PENDING
        ).count()
        
        # Pending OT (Only from my team)
        pending_ot = db.query(OTRequest).join(OTRequest.user).filter(
            User.manager_id == current_user.id,
            OTRequest.status == OTStatus.PENDING
        ).count()
        
        # Approved Today (Leaves + OT actions taken today? Or just approved leaves today?)
        today = date.today()
        on_leave_today = db.query(LeaveRequest).join(LeaveRequest.user).filter(
            User.manager_id == current_user.id,
            LeaveRequest.status == LeaveStatus.APPROVED,
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today
        ).count()
        
        return {
            "total_employees": my_team_count, 
            "pending_leaves": pending_leaves,
            "pending_ot": pending_ot,
            "on_leave_today": on_leave_today
        }

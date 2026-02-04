from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.leave import (
    LeaveRequest, LeaveRequestCreate, LeaveRequestUpdate,
    LeaveType, LeaveTypeCreate,
    Holiday, HolidayCreate
)
from app.repositories.leave import leave_repository
import datetime

router = APIRouter()

# --- LEAVE TYPES (Admin Config) ---
@router.post("/types", response_model=LeaveType)
def create_leave_type(
    *,
    db: Session = Depends(deps.get_db),
    leave_type_in: LeaveTypeCreate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Create a new Leave Type (Admin/Manager only).
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return leave_repository.create_leave_type(db, leave_type_in)

@router.get("/types", response_model=List[LeaveType])
def read_leave_types(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all leave types.
    """
    return leave_repository.get_leave_types(db)

# --- HOLIDAYS ---
@router.post("/holidays", response_model=Holiday)
def create_holiday(
    *,
    db: Session = Depends(deps.get_db),
    holiday_in: HolidayCreate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Create a new Holiday.
    """
    return leave_repository.create_holiday(db, holiday_in)

@router.get("/holidays", response_model=List[Holiday])
def read_holidays(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all holidays.
    """
    return leave_repository.get_holidays(db)

# --- LEAVE REQUESTS ---
@router.post("/", response_model=LeaveRequest)
def apply_leave(
    *,
    db: Session = Depends(deps.get_db),
    leave_in: LeaveRequestCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Apply for a leave.
    """
    # Calculate days logic (simplified for now)
    delta = leave_in.end_date - leave_in.start_date
    total_days = delta.days + 1
    
    if total_days <= 0:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    return leave_repository.create_leave_request(
        db, leave_in, user_id=current_user.id, total_days=float(total_days)
    )

@router.get("/", response_model=List[LeaveRequest])
def read_leaves(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get leaves. 
    - If Admin: Get ALL leaves.
    - If Manager: Get leaves of subordinates (TODO).
    - If Employee: Get OWN leaves.
    """
    if current_user.role == "ADMIN":
        return leave_repository.get_leave_requests(db, skip=skip, limit=limit)
    else:
        return leave_repository.get_leave_requests(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/approvals", response_model=List[LeaveRequest])
def read_pending_approvals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Get pending leave approvals.
    - Admin: All pending.
    - Manager: Pending for direct reports.
    """
    is_admin = (current_user.role == "ADMIN")
    return leave_repository.get_pending_approvals(
        db, manager_id=current_user.id, is_admin=is_admin, skip=skip, limit=limit
    )

@router.put("/{leave_id}", response_model=LeaveRequest)
def approve_leave(
    *,
    db: Session = Depends(deps.get_db),
    leave_id: int,
    leave_update: LeaveRequestUpdate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Approve/Reject leave.
    """
    leave = leave_repository.get_leave_request(db, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    # Permission Check
    is_admin = (current_user.role == "ADMIN")
    is_manager = (current_user.role == "MANAGER" and leave.user.manager_id == current_user.id)
    
    if not is_admin and not is_manager:
        raise HTTPException(
            status_code=403, 
            detail="Not authorized to action this request."
        )

    # Status State Machine
    from app.models.leave import LeaveStatus
    new_status = leave_update.status

    if new_status == LeaveStatus.APPROVED:
        # User requested: "Either the Manager or the Admin should be able to approve it."
        # So we allow the transition to APPROVED for both roles.
        
        if is_manager or is_admin:
            # Simply allow it. 
            # We don't enforce PENDING_ADMIN intermediate state anymore.
            pass
        else:
             # Should be caught by top permission check, but safe fallback
             raise HTTPException(status_code=403, detail="Not authorized")

    return leave_repository.update_leave_status(
        db, leave, leave_update, approver_id=current_user.id
    )

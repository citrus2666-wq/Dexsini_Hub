from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, time

from app.api import deps
from app.models.user import User
from app.schemas.ot import OTRequest, OTRequestCreate, OTRequestUpdate
from app.repositories.ot import ot_repository

router = APIRouter()

@router.post("/", response_model=OTRequest)
def create_ot_request(
    *,
    db: Session = Depends(deps.get_db),
    ot_in: OTRequestCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Submit an Overtime Request.
    """
    # Calculate hours
    start_dt = datetime.combine(date.min, ot_in.start_time)
    end_dt = datetime.combine(date.min, ot_in.end_time)
    
    if end_dt <= start_dt:
        # Handle overnight OT if needed, but for now assume same day or error
        # If end time < start time, maybe it's next day? 
        # For simplicity, let's enforce end_time > start_time or handle wrap around
        # Simple fix: if end < start, add 24 hours (next day)
        end_dt = datetime.combine(date.min, ot_in.end_time).replace(day=2)
    
    diff = end_dt - start_dt
    total_hours = diff.total_seconds() / 3600
    
    if total_hours <= 0:
         raise HTTPException(status_code=400, detail="Invalid time duration")

    return ot_repository.create(db, ot_in, user_id=current_user.id, total_hours=round(total_hours, 2))

@router.get("/", response_model=List[OTRequest])
def read_ot_requests(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get OT requests. Admin sees all, Employee sees own.
    """
    if current_user.role == "ADMIN":
        return ot_repository.get_multi(db, skip=skip, limit=limit)
    else:
        return ot_repository.get_multi(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/approvals", response_model=List[OTRequest])
def read_pending_approvals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Get pending OT approvals.
    """
    is_admin = (current_user.role == "ADMIN")
    return ot_repository.get_pending_approvals(
        db, manager_id=current_user.id, is_admin=is_admin, skip=skip, limit=limit
    )

@router.put("/{ot_id}", response_model=OTRequest)
def approve_ot_request(
    *,
    db: Session = Depends(deps.get_db),
    ot_id: int,
    ot_update: OTRequestUpdate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Approve/Reject OT request. Manager/Admin only.
    """
    ot = ot_repository.get(db, id=ot_id)
    if not ot:
         raise HTTPException(status_code=404, detail="OT request not found")
         
    # Permission Check
    is_admin = (current_user.role == "ADMIN")
    is_manager = (current_user.role == "MANAGER" and ot.user.manager_id == current_user.id)
    
    if not is_admin and not is_manager:
        raise HTTPException(
            status_code=403, 
            detail="You are not authorized to approve this OT request."
        )

    return ot_repository.update_status(db, ot, ot_update, approver_id=current_user.id)

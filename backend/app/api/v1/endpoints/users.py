from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.repositories.user import user_repository

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Retrieve users. Only for Managers/Admins.
    """
    users = user_repository.get_multi(db, skip=skip, limit=limit)
    return users

@router.get("/team", response_model=List[UserSchema])
def read_team_members(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Retrieve users managed by the current user.
    """
    users = user_repository.get_by_manager(db, manager_id=current_user.id, skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserSchema)
def create_user_by_admin(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Create new user. Only for Managers/Admins.
    """
    if current_user.role != "ADMIN" and user_in.role == "ADMIN":
         raise HTTPException(
            status_code=403,
            detail="Only Admins can create other Admins.",
        )
        
    user = user_repository.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = user_repository.create(db, user_in=user_in)
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user_by_admin(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Update a user. Only for Managers/Admins.
    """
    user = user_repository.get(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    user = user_repository.update(db, db_obj=user, obj_in=user_in)
    return user

@router.get("/me", response_model=UserSchema)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    return current_user

@router.delete("/{user_id}", response_model=UserSchema)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Delete a user. Only for Admins.
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can delete users.",
        )
        
    user = user_repository.get(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist",
        )
    if user.id == current_user.id:
         raise HTTPException(
            status_code=400,
            detail="You cannot delete yourself.",
        )
        
    user = user_repository.remove(db, id=user_id)
    return user

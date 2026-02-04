from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.ot import OTRequest
from app.schemas.ot import OTRequestCreate, OTRequestUpdate

class OTRepository:
    def create(self, db: Session, obj_in: OTRequestCreate, user_id: int, total_hours: float) -> OTRequest:
        db_obj = OTRequest(
            **obj_in.dict(),
            user_id=user_id,
            total_hours=total_hours
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi(self, db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[OTRequest]:
        query = db.query(OTRequest)
        if user_id:
            query = query.filter(OTRequest.user_id == user_id)
        return query.order_by(OTRequest.created_at.desc()).offset(skip).limit(limit).all()

    def get(self, db: Session, id: int) -> Optional[OTRequest]:
        return db.query(OTRequest).filter(OTRequest.id == id).first()

    def get_pending_approvals(self, db: Session, manager_id: int, is_admin: bool = False, skip: int = 0, limit: int = 100) -> List[OTRequest]:
        from app.models.ot import OTStatus
        if is_admin:
            return db.query(OTRequest).filter(
                OTRequest.status == OTStatus.PENDING
            ).order_by(OTRequest.created_at.asc()).offset(skip).limit(limit).all()
        else:
            from app.models.user import User
            # Explicit join on OTRequest.user based on our previous fix
            return db.query(OTRequest).join(OTRequest.user).filter(
                OTRequest.status == OTStatus.PENDING,
                User.manager_id == manager_id
            ).order_by(OTRequest.created_at.asc()).offset(skip).limit(limit).all()

    def update_status(self, db: Session, db_obj: OTRequest, obj_in: OTRequestUpdate, approver_id: int) -> OTRequest:
        db_obj.status = obj_in.status
        db_obj.manager_comment = obj_in.manager_comment
        db_obj.approver_id = approver_id
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

ot_repository = OTRepository()

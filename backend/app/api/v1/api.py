from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, leaves, ot, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(leaves.router, prefix="/leaves", tags=["leaves"])
api_router.include_router(ot.router, prefix="/ot", tags=["ot"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

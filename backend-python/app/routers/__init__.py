# Routers FastAPI
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.spaces import router as spaces_router
from app.routers.items import router as items_router
from app.routers.friends import router as friends_router
from app.routers.notifications import router as notifications_router

__all__ = ['auth_router', 'users_router', 'spaces_router', 'items_router', 'friends_router', 'notifications_router']
"""
Schemas Pydantic para User.
Correspondem ao modelo Mongoose em backend-node/src/models/User.js
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# Schema base (campos compartilhados)
class UserBase(BaseModel):
    id: str
    email: EmailStr
    full_name: str = ''
    username: str = ''
    bio: str = ''
    avatar_url: str = ''


# Schema para criação (recebe password)
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ''


# Schema para login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Schema de resposta (sem password)
class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str = ''
    username: str = ''
    bio: str = ''
    avatar_url: str = ''
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None


# Schema para token JWT
class TokenResponse(BaseModel):
    token: str
    user: UserResponse


# Schema para atualização de perfil
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
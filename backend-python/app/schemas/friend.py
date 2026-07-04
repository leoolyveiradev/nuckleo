"""
Schemas Pydantic para FriendRequest.
Correspondem ao modelo Mongoose em backend-node/src/models/FriendRequest.js
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


# Schema base
class FriendBase(BaseModel):
    id: str
    from_user: str
    to_user: str
    status: str = 'pending'


# Schema para criação
class FriendCreate(BaseModel):
    from_user: str
    to_user: str


# Schema de resposta
class FriendResponse(BaseModel):
    id: str
    from_user: str
    to_user: str
    status: str = 'pending'
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None


# Schema para atualização (responder ao pedido)
class FriendUpdate(BaseModel):
    status: str

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ('accepted', 'rejected'):
            raise ValueError('Status deve ser accepted ou rejected')
        return v
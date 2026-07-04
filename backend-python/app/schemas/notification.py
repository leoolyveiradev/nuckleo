"""
Schemas Pydantic para Notification.
Correspondem ao modelo Mongoose em backend-node/src/models/Notification.js
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


# Schema base
class NotificationBase(BaseModel):
    id: str
    user_email: str
    type: str
    title: str
    message: str = ''
    is_read: bool = False
    link: str = ''


# Schema para criação
class NotificationCreate(BaseModel):
    user_email: str
    type: str
    title: str
    message: str = ''
    link: str = ''

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        valid_types = ['friend_request', 'friend_accepted', 'item_shared', 'comment']
        if v not in valid_types:
            raise ValueError(f'Type deve ser um dos: {", ".join(valid_types)}')
        return v


# Schema de resposta
class NotificationResponse(BaseModel):
    id: str
    user_email: str
    type: str
    title: str
    message: str = ''
    is_read: bool = False
    link: str = ''
    created_date: Optional[datetime] = None


# Schema para atualizar leitura
class NotificationUpdateRead(BaseModel):
    is_read: bool = True
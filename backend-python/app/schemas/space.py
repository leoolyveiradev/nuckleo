"""
Schemas Pydantic para Space.
Correspondem ao modelo Mongoose em backend-node/src/models/Space.js
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Schema base
class SpaceBase(BaseModel):
    id: str
    title: str
    description: str = ''
    emoji: str = '📁'
    visibility: str = 'private'
    tags: list[str] = []
    item_count: int = 0
    created_by: str


# Schema para criação
class SpaceCreate(BaseModel):
    title: str
    description: str = ''
    emoji: str = '📁'
    visibility: str = 'private'
    tags: list[str] = []
    created_by: str


# Schema de resposta
class SpaceResponse(BaseModel):
    id: str
    title: str
    description: str = ''
    emoji: str = '📁'
    visibility: str = 'private'
    tags: list[str] = []
    item_count: int = 0
    created_by: str
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None


# Schema para atualização (todos os campos opcionais)
class SpaceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    emoji: Optional[str] = None
    visibility: Optional[str] = None
    tags: Optional[list[str]] = None
    item_count: Optional[int] = None
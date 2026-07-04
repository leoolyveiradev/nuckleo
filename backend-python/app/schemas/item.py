"""
Schemas Pydantic para Item.
Correspondem ao modelo Mongoose em backend-node/src/models/Item.js
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Schema base
class ItemBase(BaseModel):
    id: str
    title: str
    type: str = 'note'
    content: str = ''
    code_language: str = ''
    file_url: str = ''
    file_name: str = ''
    visibility: str = 'private'
    tags: list[str] = []
    is_pinned: bool = False
    is_favorite: bool = False
    space_id: str
    created_by: str


# Schema para criação
class ItemCreate(BaseModel):
    title: str
    type: str = 'note'
    content: str = ''
    code_language: str = ''
    file_url: str = ''
    file_name: str = ''
    visibility: str = 'private'
    tags: list[str] = []
    is_pinned: bool = False
    space_id: str
    created_by: str


# Schema de resposta
class ItemResponse(BaseModel):
    id: str
    title: str
    type: str = 'note'
    content: str = ''
    code_language: str = ''
    file_url: str = ''
    file_name: str = ''
    visibility: str = 'private'
    tags: list[str] = []
    is_pinned: bool = False
    is_favorite: bool = False
    space_id: str
    created_by: str
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None


# Schema para atualização
class ItemUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    content: Optional[str] = None
    code_language: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    visibility: Optional[str] = None
    tags: Optional[list[str]] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None
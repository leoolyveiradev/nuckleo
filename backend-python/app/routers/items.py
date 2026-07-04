"""
Router de itens /api/items.
Corresponde a backend-node/src/routes/items.js
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.auth import decode_token

router = APIRouter(prefix='/api/items', tags=['items'])
security = HTTPBearer()


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
) -> Optional[dict]:
    """Dependência opcional para obter usuário atual via JWT."""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        return payload
    except Exception:
        return None


@router.get('/', response_model=list[ItemResponse])
async def list_items(
    space_id: str = Query(None, description="Filtrar por espaço"),
    visibility: str = Query(None, description="Filtrar por visibilidade"),
    created_by: str = Query(None, description="Filtrar por criador"),
    sort: str = Query('-created_date', description="Ordenação"),
    limit: int = Query(50, le=100),
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Lista todos os itens com filtros.
    Corresponde a GET /api/items no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    query = {}
    if space_id:
        query['space_id'] = space_id
    if visibility:
        query['visibility'] = visibility
    if created_by:
        query['created_by'] = created_by

    # Converter sort
    sort_field = sort.lstrip('-')
    sort_direction = -1 if sort.startswith('-') else 1

    cursor = db.items.find(query).sort(sort_field, sort_direction).limit(limit)
    items = await cursor.to_list(length=limit)

    return [
        ItemResponse(
            id=i['id'],
            title=i['title'],
            type=i.get('type', 'note'),
            content=i.get('content', ''),
            code_language=i.get('code_language', ''),
            file_url=i.get('file_url', ''),
            file_name=i.get('file_name', ''),
            visibility=i.get('visibility', 'private'),
            tags=i.get('tags', []),
            is_pinned=i.get('is_pinned', False),
            is_favorite=i.get('is_favorite', False),
            space_id=i['space_id'],
            created_by=i['created_by'],
            created_date=i.get('created_date'),
            updated_date=i.get('updated_date'),
        )
        for i in items
    ]


@router.get('/{item_id}', response_model=ItemResponse)
async def get_item(
    item_id: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Busca item por ID.
    Corresponde a GET /api/items/:id no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    item = await db.items.find_one({'id': item_id})

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Item não encontrado',
        )

    return ItemResponse(
        id=item['id'],
        title=item['title'],
        type=item.get('type', 'note'),
        content=item.get('content', ''),
        code_language=item.get('code_language', ''),
        file_url=item.get('file_url', ''),
        file_name=item.get('file_name', ''),
        visibility=item.get('visibility', 'private'),
        tags=item.get('tags', []),
        is_pinned=item.get('is_pinned', False),
        is_favorite=item.get('is_favorite', False),
        space_id=item['space_id'],
        created_by=item['created_by'],
        created_date=item.get('created_date'),
        updated_date=item.get('updated_date'),
    )


@router.post('/', response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    body: ItemCreate,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Cria novo item.
    Corresponde a POST /api/items no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    if not body.title or not body.space_id or not body.created_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Title, space_id e created_by são obrigatórios',
        )

    now = datetime.utcnow()
    item_id = 'i' + str(int(now.timestamp() * 1000))

    new_item = {
        'id': item_id,
        'title': body.title,
        'type': body.type or 'note',
        'content': body.content or '',
        'code_language': body.code_language or '',
        'file_url': body.file_url or '',
        'file_name': body.file_name or '',
        'visibility': body.visibility or 'private',
        'tags': body.tags or [],
        'is_pinned': body.is_pinned or False,
        'is_favorite': False,
        'space_id': body.space_id,
        'created_by': body.created_by,
        'created_date': now,
        'updated_date': now,
    }

    await db.items.insert_one(new_item)

    return ItemResponse(
        id=new_item['id'],
        title=new_item['title'],
        type=new_item['type'],
        content=new_item['content'],
        code_language=new_item['code_language'],
        file_url=new_item['file_url'],
        file_name=new_item['file_name'],
        visibility=new_item['visibility'],
        tags=new_item['tags'],
        is_pinned=new_item['is_pinned'],
        is_favorite=new_item['is_favorite'],
        space_id=new_item['space_id'],
        created_by=new_item['created_by'],
        created_date=new_item['created_date'],
        updated_date=new_item['updated_date'],
    )


@router.put('/{item_id}', response_model=ItemResponse)
async def update_item(
    item_id: str,
    body: ItemUpdate,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Atualiza item.
    Corresponde a PUT /api/items/:id no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    # Filtra campos não nulos
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Nenhum campo para atualizar',
        )

    updates['updated_date'] = datetime.utcnow()

    item = await db.items.find_one_and_update(
        {'id': item_id},
        {'$set': updates},
        return_document=True,
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Item não encontrado',
        )

    return ItemResponse(
        id=item['id'],
        title=item['title'],
        type=item.get('type', 'note'),
        content=item.get('content', ''),
        code_language=item.get('code_language', ''),
        file_url=item.get('file_url', ''),
        file_name=item.get('file_name', ''),
        visibility=item.get('visibility', 'private'),
        tags=item.get('tags', []),
        is_pinned=item.get('is_pinned', False),
        is_favorite=item.get('is_favorite', False),
        space_id=item['space_id'],
        created_by=item['created_by'],
        created_date=item.get('created_date'),
        updated_date=item.get('updated_date'),
    )


@router.delete('/{item_id}')
async def delete_item(
    item_id: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Deleta item.
    Corresponde a DELETE /api/items/:id no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    item = await db.items.find_one_and_delete({'id': item_id})

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Item não encontrado',
        )

    return {'message': 'Item deletado'}
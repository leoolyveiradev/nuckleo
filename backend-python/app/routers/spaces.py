"""
Router de espaços /api/spaces.
Corresponde a backend-node/src/routes/spaces.js
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.schemas.space import SpaceCreate, SpaceResponse, SpaceUpdate
from app.auth import decode_token

router = APIRouter(prefix='/api/spaces', tags=['spaces'])
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


@router.get('/', response_model=list[SpaceResponse])
async def list_spaces(
    visibility: str = Query(None, description="Filtrar por visibilidade"),
    created_by: str = Query(None, description="Filtrar por criador"),
    sort: str = Query('-created_date', description="Ordenação"),
    limit: int = Query(50, le=100),
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Lista todos os espaços com filtros.
    Corresponde a GET /api/spaces no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    query = {}
    if visibility:
        query['visibility'] = visibility
    if created_by:
        query['created_by'] = created_by

    # Converter sort (remover '-' para usar em MongoDB)
    sort_field = sort.lstrip('-')
    sort_direction = -1 if sort.startswith('-') else 1

    cursor = db.spaces.find(query).sort(sort_field, sort_direction).limit(limit)
    spaces = await cursor.to_list(length=limit)

    return [
        SpaceResponse(
            id=s['id'],
            title=s['title'],
            description=s.get('description', ''),
            emoji=s.get('emoji', '📁'),
            visibility=s.get('visibility', 'private'),
            tags=s.get('tags', []),
            item_count=s.get('item_count', 0),
            created_by=s['created_by'],
            created_date=s.get('created_date'),
            updated_date=s.get('updated_date'),
        )
        for s in spaces
    ]


@router.get('/{space_id}', response_model=SpaceResponse)
async def get_space(
    space_id: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Busca espaço por ID.
    Corresponde a GET /api/spaces/:id no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    space = await db.spaces.find_one({'id': space_id})

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Espaço não encontrado',
        )

    return SpaceResponse(
        id=space['id'],
        title=space['title'],
        description=space.get('description', ''),
        emoji=space.get('emoji', '📁'),
        visibility=space.get('visibility', 'private'),
        tags=space.get('tags', []),
        item_count=space.get('item_count', 0),
        created_by=space['created_by'],
        created_date=space.get('created_date'),
        updated_date=space.get('updated_date'),
    )


@router.post('/', response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
async def create_space(
    body: SpaceCreate,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Cria novo espaço.
    Corresponde a POST /api/spaces no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    if not body.title or not body.created_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Título e created_by são obrigatórios',
        )

    now = datetime.utcnow()
    space_id = 's' + str(int(now.timestamp() * 1000))

    new_space = {
        'id': space_id,
        'title': body.title,
        'description': body.description or '',
        'emoji': body.emoji or '📁',
        'visibility': body.visibility or 'private',
        'tags': body.tags or [],
        'item_count': 0,
        'created_by': body.created_by,
        'created_date': now,
        'updated_date': now,
    }

    await db.spaces.insert_one(new_space)

    return SpaceResponse(
        id=new_space['id'],
        title=new_space['title'],
        description=new_space['description'],
        emoji=new_space['emoji'],
        visibility=new_space['visibility'],
        tags=new_space['tags'],
        item_count=new_space['item_count'],
        created_by=new_space['created_by'],
        created_date=new_space['created_date'],
        updated_date=new_space['updated_date'],
    )


@router.put('/{space_id}', response_model=SpaceResponse)
async def update_space(
    space_id: str,
    body: SpaceUpdate,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Atualiza espaço.
    Corresponde a PUT /api/spaces/:id no Node.js.
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

    space = await db.spaces.find_one_and_update(
        {'id': space_id},
        {'$set': updates},
        return_document=True,
    )

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Espaço não encontrado',
        )

    return SpaceResponse(
        id=space['id'],
        title=space['title'],
        description=space.get('description', ''),
        emoji=space.get('emoji', '📁'),
        visibility=space.get('visibility', 'private'),
        tags=space.get('tags', []),
        item_count=space.get('item_count', 0),
        created_by=space['created_by'],
        created_date=space.get('created_date'),
        updated_date=space.get('updated_date'),
    )


@router.delete('/{space_id}')
async def delete_space(
    space_id: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Deleta espaço.
    Corresponde a DELETE /api/spaces/:id no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    space = await db.spaces.find_one_and_delete({'id': space_id})

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Espaço não encontrado',
        )

    return {'message': 'Espaço deletado'}
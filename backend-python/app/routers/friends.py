"""
Roteador FastAPI para Friends (FriendRequest).
Corresponde a backend-node/src/routes/friends.js
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.schemas.friend import FriendCreate, FriendResponse, FriendUpdate
from app.auth import get_current_user_optional

router = APIRouter(prefix='/api/friends', tags=['friends'])
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """JWT opcional - retornaNone se token não informado."""
    if not credentials:
        return None
    # Token provided but we don't validate for now (optional auth)
    return {'id': credentials.credentials}


# Listar pedidos de amizade
@router.get('/', response_model=list[FriendResponse])
async def list_friends(
    to_user: str = Query(None, description="Filtrar por destinatário"),
    from_user: str = Query(None, description="Filtrar por remetente"),
    status: str = Query(None, description="Filtrar por status"),
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Lista todos os pedidos de amizade com filtros.
    Corresponde a GET /api/friends no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    query = {}
    if to_user:
        query['to_user'] = to_user
    if from_user:
        query['from_user'] = from_user
    if status:
        query['status'] = status

    cursor = db.friend_requests.find(query).sort('created_date', -1)
    friends = await cursor.to_list(length=100)

    return [
        FriendResponse(
            id=f['id'],
            from_user=f['from_user'],
            to_user=f['to_user'],
            status=f.get('status', 'pending'),
            created_date=f.get('created_date'),
            updated_date=f.get('updated_date'),
        )
        for f in friends
    ]


# Enviar pedido de amizade
@router.post('/', response_model=FriendResponse, status_code=status.HTTP_201_CREATED)
async def create_friend(
    body: FriendCreate,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Envia pedido de amizade.
    Corresponde a POST /api/friends no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    if not body.from_user or not body.to_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='from_user e to_user são obrigatórios',
        )

    if body.from_user == body.to_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Não pode adicionar a si mesmo',
        )

    # Verificar se já existe pedido pendente
    existing = await db.friend_requests.find_one({
        '$or': [
            {'from_user': body.from_user, 'to_user': body.to_user, 'status': 'pending'},
            {'from_user': body.to_user, 'to_user': body.from_user, 'status': 'pending'},
        ],
    })

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Pedido já existente',
        )

    now = datetime.utcnow()
    friend = {
        'id': 'f' + str(int(now.timestamp() * 1000)),
        'from_user': body.from_user,
        'to_user': body.to_user,
        'status': 'pending',
        'created_date': now,
        'updated_date': now,
    }

    await db.friend_requests.insert_one(friend)

    return FriendResponse(
        id=friend['id'],
        from_user=friend['from_user'],
        to_user=friend['to_user'],
        status=friend['status'],
        created_date=friend['created_date'],
        updated_date=friend['updated_date'],
    )


# Responder ao pedido (aceitar/rejeitar)
@router.put('/{friend_id}', response_model=FriendResponse)
async def update_friend(
    friend_id: str,
    body: FriendUpdate,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Responde ao pedido de amizade (aceitar/rejeitar).
    Corresponde a PUT /api/friends/:id no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    if body.status not in ('accepted', 'rejected'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Status deve ser accepted ou rejected',
        )

    now = datetime.utcnow()
    result = await db.friend_requests.find_one_and_update(
        {'id': friend_id},
        {'$set': {'status': body.status, 'updated_date': now}},
        return_document=True,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Pedido não encontrado',
        )

    return FriendResponse(
        id=result['id'],
        from_user=result['from_user'],
        to_user=result['to_user'],
        status=result.get('status', 'pending'),
        created_date=result.get('created_date'),
        updated_date=result.get('updated_date'),
    )
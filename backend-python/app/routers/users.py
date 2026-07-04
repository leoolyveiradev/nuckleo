"""
Router de usuários /api/users.
Corresponde a backend-node/src/routes/users.js (list, get, update)
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.auth import decode_token

router = APIRouter(prefix='/api/users', tags=['users'])
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


@router.get('/', response_model=list[UserResponse])
async def list_users(
    search: str = Query(None, description="Buscar por nome, username ou email"),
    limit: int = Query(20, le=100),
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Lista usuários.
    Corresponde a GET /api/users no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    query = {}
    if search:
        query = {
            '$or': [
                {'full_name': {'$regex': search, '$options': 'i'}},
                {'username': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
            ]
        }

    users = await db.users.find(query).to_list(length=limit)

    return [
        UserResponse(
            id=u['id'],
            email=u['email'],
            full_name=u.get('full_name', ''),
            username=u.get('username', ''),
            bio=u.get('bio', ''),
            avatar_url=u.get('avatar_url', ''),
            created_date=u.get('created_date'),
            updated_date=u.get('updated_date'),
        )
        for u in users
    ]


@router.get('/{id_or_email}', response_model=UserResponse)
async def get_user(
    id_or_email: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Busca usuário por ID ou email.
    Corresponde a GET /api/users/:idOrEmail no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    user = await db.users.find_one({
        '$or': [{'id': id_or_email}, {'email': id_or_email}],
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuário não encontrado',
        )

    return UserResponse(
        id=user['id'],
        email=user['email'],
        full_name=user.get('full_name', ''),
        username=user.get('username', ''),
        bio=user.get('bio', ''),
        avatar_url=user.get('avatar_url', ''),
        created_date=user.get('created_date'),
        updated_date=user.get('updated_date'),
    )


@router.put('/me', response_model=UserResponse)
async def update_me(
    body: UserUpdate,
    current_user: dict = Depends(get_current_user_optional),
):
    """
    Atualiza perfil do usuário atual.
    Corresponde a PUT /api/users/me no Node.js.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Autenticação necessária',
        )

    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    user_id = current_user.get('id')

    # Filtra campos não nulos
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Nenhum campo para atualizar',
        )

    updates['updated_date'] = datetime.utcnow()

    user = await db.users.find_one_and_update(
        {'id': user_id},
        {'$set': updates},
        return_document=True,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuário não encontrado',
        )

    return UserResponse(
        id=user['id'],
        email=user['email'],
        full_name=user.get('full_name', ''),
        username=user.get('username', ''),
        bio=user.get('bio', ''),
        avatar_url=user.get('avatar_url', ''),
        created_date=user.get('created_date'),
        updated_date=user.get('updated_date'),
    )
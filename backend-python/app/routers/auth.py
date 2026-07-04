"""
Router de autenticação /api/auth.
Corresponde a backend-node/src/routes/users.js (login e register)
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix='/api/auth', tags=['auth'])
security = HTTPBearer()


async def get_current_user_dep(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Dependência para obter usuário atual via JWT."""
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get('id')
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token inválido',
        )
    return payload


@router.post('/login', response_model=TokenResponse)
async def login(body: UserLogin):
    """
    Login de usuário.
    Corresponde a POST /api/users/login no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    # Busca usuário por email
    user = await db.users.find_one({'email': body.email})

    if not user or not verify_password(body.password, user.get('password', '')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Email ou senha inválidos',
        )

    # Cria token JWT
    token = create_access_token({'sub': user['email'], 'id': user['id']})

    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            full_name=user.get('full_name', ''),
            username=user.get('username', ''),
            bio=user.get('bio', ''),
            avatar_url=user.get('avatar_url', ''),
            created_date=user.get('created_date'),
            updated_date=user.get('updated_date'),
        ),
    )


@router.post('/register', response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate):
    """
    Registro de novo usuário.
    Corresponde a POST /api/users/register no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    # Verifica se email já existe
    existing = await db.users.find_one({'email': body.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email já cadastrado',
        )

    # Cria usuário
    now = datetime.utcnow()
    user_id = 'u' + str(int(now.timestamp() * 1000))

    new_user = {
        'id': user_id,
        'email': body.email,
        'password': hash_password(body.password),
        'full_name': body.full_name or '',
        'username': '',
        'bio': '',
        'avatar_url': '',
        'created_date': now,
        'updated_date': now,
    }

    await db.users.insert_one(new_user)

    # Cria token JWT
    token = create_access_token({'sub': body.email, 'id': user_id})

    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user_id,
            email=body.email,
            full_name=body.full_name,
        ),
    )


@router.get('/me', response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user_dep)):
    """
    Retrieves the current user.
    Corresponds to GET /api/users/me in Node.js
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    user_id = current_user.get('id')
    user = await db.users.find_one({'id': user_id})

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
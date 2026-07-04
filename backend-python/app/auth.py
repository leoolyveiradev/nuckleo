"""
Utilitários de autenticação JWT.
Correspondem ao middleware auth em backend-node/src/middleware/auth.js
"""

import os
from datetime import datetime, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from dotenv import load_dotenv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env')

# Configurações
JWT_SECRET = os.getenv('JWT_SECRET', 'nuckleo-secret-dev')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 7 * 24 * 60 * 60  # 7 dias em segundos

# Crypt context para senhas (similar ao bcrypt do Node.js)
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# Security scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hasheia senha (similar a bcrypt.hash no Node.js)."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica senha (similar a user.comparePassword no Node.js)."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Cria token JWT (similar ao Node.js)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc).timestamp() + JWT_EXPIRATION
    to_encode.update({'exp': expire})

    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decodifica token JWT (retorna payload)."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token inválido',
            headers={'WWW-Authenticate': 'Bearer'},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = None,
) -> dict:
    """Dependência FastAPI para verificar JWT."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Credenciais não fornecidas',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    token = credentials.credentials
    payload = decode_token(token)

    user_data = payload.get('sub') or payload
    if isinstance(user_data, dict):
        return user_data

    return {'id': payload.get('id'), 'email': payload.get('email')}


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = None,
) -> Optional[dict]:
    """Dependência JWT opcional - retorna None se token não informado."""
    if not credentials:
        return None

    try:
        token = credentials.credentials
        payload = decode_token(token)
        user_data = payload.get('sub') or payload
        if isinstance(user_data, dict):
            return user_data
        return {'id': payload.get('id'), 'email': payload.get('email')}
    except HTTPException:
        return None
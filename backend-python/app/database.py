"""
Conexão MongoDB usando motor (async driver).
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env')

# Cliente MongoDB (global)
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_mongo_uri() -> str:
    """Retorna URI do MongoDB das variáveis de ambiente."""
    return os.getenv('MONGO_URI', '')


def get_database_name() -> str:
    """Retorna nome do banco de dados."""
    return os.getenv('MONGO_DB', 'nuckleo')


async def connect_mongo():
    """Conecta ao MongoDB. Chamar na inicialização."""
    global _client, _db
    uri = get_mongo_uri()
    if not uri:
        print('[mongo] MONGO_URI não definida.')
        return False

    try:
        _client = AsyncIOMotorClient(uri)
        db_name = get_database_name()
        _db = _client[db_name]
        # Testa conexão
        await _client.admin.command('ping')
        print(f'[mongo] Conectado ao banco: {db_name}')
        return True
    except Exception as e:
        print(f'[mongo] Erro ao conectar: {e}')
        return False


def get_db() -> AsyncIOMotorDatabase | None:
    """Retorna instância do banco de dados."""
    return _db


async def close_mongo():
    """Fecha conexão MongoDB."""
    global _client
    if _client:
        _client.close()
        print('[mongo] Conexão fechada.')
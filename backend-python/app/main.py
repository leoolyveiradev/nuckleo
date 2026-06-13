import os
from datetime import datetime
from pathlib import Path

import pymysql
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / '.env')

app = FastAPI(
    title='Nuckleo AI Agent',
    description='Agente de contexto e personalização — servidor local Python',
    version='1.0.0',
)

cors_origins = [
    o.strip()
    for o in os.getenv('CORS_ORIGIN', 'http://localhost:5500').split(',')
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class AgentRequest(BaseModel):
    message: str = Field(..., min_length=1)
    current_page: str = Field(default='dashboard')


class AgentResponse(BaseModel):
    response: str
    action: str | None = None


def log_ai_interaction(message: str, action: str | None) -> None:
    """Auditoria em MySQL — falha silenciosa se o banco estiver offline."""
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER', 'nuckleo'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DB', 'nuckleo_ai'),
            charset='utf8mb4',
        )
        with conn.cursor() as cur:
            cur.execute(
                '''
                CREATE TABLE IF NOT EXISTS ai_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    created_at DATETIME NOT NULL,
                    message_length INT NOT NULL,
                    action_taken VARCHAR(64) NULL
                )
                '''
            )
            cur.execute(
                'INSERT INTO ai_logs (created_at, message_length, action_taken) VALUES (%s, %s, %s)',
                (datetime.utcnow(), len(message), action),
            )
        conn.commit()
        conn.close()
    except Exception as exc:
        print(f'[ai_logs] MySQL indisponível — log ignorado: {exc}')


def resolve_action(message: str) -> tuple[str, str | None]:
    text = message.lower()
    if any(k in text for k in ('cor', 'tema', 'personalizar', 'mudar visual')):
        return (
            'Posso ajudar você a personalizar o tema! Quer experimentar o modo Cyberpunk ou Matrix?',
            'suggest_theme_change',
        )
    if any(k in text for k in ('criar pasta', 'novo espaço', 'novo espaco', 'criar espaço')):
        return (
            'Para criar um novo espaço, use o botão "Nova Pasta" no painel ou o atalho no menu lateral.',
            'highlight_create_space',
        )
    return (
        'Olá! Sou o agente do Nuckleo. Posso ajudar com organização, temas e navegação. O que você precisa?',
        None,
    )


@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'nuckleo-backend-python'}


@app.post('/api/ai/agent', response_model=AgentResponse)
def ai_agent(body: AgentRequest):
    response_text, action = resolve_action(body.message)
    log_ai_interaction(body.message, action)
    return AgentResponse(response=response_text, action=action)


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(
        'app.main:app',
        host=os.getenv('PYTHON_HOST', '0.0.0.0'),
        port=int(os.getenv('PYTHON_PORT', 8000)),
        reload=True,
    )

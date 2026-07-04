"""
Nuckleo Backend - FastAPI
Servidor principal que substitui gradualmente o Node.js
"""

import os
from datetime import datetime
from pathlib import Path
from typing import Optional

import pymysql
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.database import connect_mongo, close_mongo, get_db
from app.routers import (
    auth_router,
    users_router,
    spaces_router,
    items_router,
    friends_router,
    notifications_router,
)

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

app = FastAPI(
    title="Nuckleo API",
    description="Backend FastAPI - substitui Node.js gradualmente",
    version="1.0.0",
)


# Lifecycle: conecta ao MongoDB ao iniciar
@app.on_event("startup")
async def startup():
    await connect_mongo()


@app.on_event("shutdown")
async def shutdown():
    await close_mongo()


# CORS
cors_origins = [o.strip() for o in os.getenv("CORS_ORIGIN", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins
    or [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(spaces_router)
app.include_router(items_router)
app.include_router(friends_router)
app.include_router(notifications_router)


# ====================
# Agente de IA (existente)
# ====================


class AgentRequest(BaseModel):
    message: str
    current_page: str = "dashboard"


class AgentResponse(BaseModel):
    response: str
    action: Optional[str] = None


def log_ai_interaction(message: str, action: Optional[str]) -> None:
    """Auditoria em MySQL - falha silenciosa se o banco estiver offline."""
    try:
        conn = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", 3306)),
            user=os.getenv("MYSQL_USER", "nuckleo"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DB", "nuckleo_ai"),
            charset="utf8mb4",
        )
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ai_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    created_at DATETIME NOT NULL,
                    message_length INT NOT NULL,
                    action_taken VARCHAR(64) NULL
                )
                """)
            cur.execute(
                "INSERT INTO ai_logs (created_at, message_length, action_taken) VALUES (%s, %s, %s)",
                (datetime.utcnow(), len(message), action),
            )
        conn.commit()
        conn.close()
    except Exception as exc:
        print(f"[ai_logs] MySQL indisponivel - log ignorado: {exc}")


def resolve_action(message: str) -> tuple[str, Optional[str]]:
    """Resolve resposta e ação based em mensagem do usuário."""
    text = message.lower()

    if any(k in text for k in ("cor", "tema", "personalizar", "mudar visual")):
        return (
            "Posso ajudar você a personalizar o tema! Quer experimentar o modo Cyberpunk ou Matrix?",
            "suggest_theme_change",
        )

    if any(k in text for k in ("criar pasta", "novo espaco", "criar espaco")):
        return (
            'Para criar um novo espaco, use o botao "Nova Pasta" no painel ou o atalho no menu lateral.',
            "highlight_create_space",
        )

    if "string" in text:
        return (
            'Em programação, uma string é uma sequência de caracteres, ou seja, texto entre aspas. Exemplo: "Olá mundo".',
            None,
        )

    if any(k in text for k in ("texto", "escrever", "novo texto", "texto novo")):
        return (
            "Para escrever um novo texto, pense no que deseja registrar e use o editor ou campo de nota do Nuckleo. Organize esse conteúdo em um item ou espaço.",
            None,
        )

    if any(k in text for k in ("como", "onde", "o que", "qual")) and any(
        k in text for k in ("item", "espaço", "campo", "pasta")
    ):
        return (
            "Você pode criar e gerenciar espaços e itens usando os botões na interface: o botão 'Novo Item' para itens e a seção 'Meus Spaces' para navegar entre espaços.",
            None,
        )

    if any(k in text for k in ("oi", "ola", "bom dia", "boa tarde", "boa noite")):
        return (
            "Oi! Sou o Kleo, seu assistente de navegação no Nuckleo. Posso te ajudar com organização, temas e navegação.",
            None,
        )

    return (
        "Ainda estou aprendendo, mas posso ajudar com organização, temas e navegação no Nuckleo. Pergunte sobre espaços, itens ou aparência do app.",
        None,
    )


# ====================
# Endpoints
# ====================


@app.get("/api/health")
async def health():
    """Health check - retorna status do MongoDB."""
    db = get_db()
    mongo_status = "disconnected"

    if db:
        try:
            await db.command("ping")
            mongo_status = "connected"
        except Exception:
            mongo_status = "disconnected"

    return {
        "status": "ok",
        "service": "nuckleo-backend-python",
        "mongo": mongo_status,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/api/ai/agent", response_model=AgentResponse)
async def ai_agent(body: AgentRequest):
    """Endpoint do agente de IA."""
    response_text, action = resolve_action(body.message)
    log_ai_interaction(body.message, action)
    return AgentResponse(response=response_text, action=action)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.getenv("PYTHON_HOST", "0.0.0.0"),
        port=int(os.getenv("PYTHON_PORT", 8000)),
        reload=True,
    )

"""
Roteador FastAPI para Notifications.
Corresponde a backend-node/src/routes/notifications.js
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationUpdateRead
from app.auth import get_current_user_optional

router = APIRouter(prefix='/api/notifications', tags=['notifications'])
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """JWT opcional - retorna None se token não informado."""
    if not credentials:
        return None
    # Token provided but we don't validate for now (optional auth)
    return {'id': credentials.credentials}


# Listar notificações do usuário
@router.get('/', response_model=list[NotificationResponse])
async def list_notifications(
    user_email: str = Query(..., description="Email do usuário"),
    is_read: bool = Query(None, description="Filtrar por status de leitura"),
    limit: int = Query(20, le=100),
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Lista notificações do usuário.
    Corresponde a GET /api/notifications no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='user_email é obrigatório',
        )

    query = {'user_email': user_email}
    if is_read is not None:
        query['is_read'] = is_read

    cursor = db.notifications.find(query).sort('created_date', -1).limit(limit)
    notifications = await cursor.to_list(length=limit)

    return [
        NotificationResponse(
            id=n['id'],
            user_email=n['user_email'],
            type=n['type'],
            title=n['title'],
            message=n.get('message', ''),
            is_read=n.get('is_read', False),
            link=n.get('link', ''),
            created_date=n.get('created_date'),
        )
        for n in notifications
    ]


# Criar notificação
@router.post('/', response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    body: NotificationCreate,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Cria nova notificação.
    Corresponde a POST /api/notifications no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    if not body.user_email or not body.type or not body.title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='user_email, type e title são obrigatórios',
        )

    now = datetime.utcnow()
    notification = {
        'id': 'n' + str(int(now.timestamp() * 1000)),
        'user_email': body.user_email,
        'type': body.type,
        'title': body.title,
        'message': body.message,
        'link': body.link,
        'is_read': False,
        'created_date': now,
    }

    await db.notifications.insert_one(notification)

    return NotificationResponse(
        id=notification['id'],
        user_email=notification['user_email'],
        type=notification['type'],
        title=notification['title'],
        message=notification['message'],
        is_read=notification['is_read'],
        link=notification['link'],
        created_date=notification['created_date'],
    )


# Marcar como lida
@router.put('/{notification_id}/read', response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Marca notificação como lida.
    Corresponde a PUT /api/notifications/:id/read no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    result = await db.notifications.find_one_and_update(
        {'id': notification_id},
        {'$set': {'is_read': True}},
        return_document=True,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Notificação não encontrada',
        )

    return NotificationResponse(
        id=result['id'],
        user_email=result['user_email'],
        type=result['type'],
        title=result['title'],
        message=result.get('message', ''),
        is_read=result.get('is_read', False),
        link=result.get('link', ''),
        created_date=result.get('created_date'),
    )


# Marcar todas como lidas
@router.put('/read-all')
async def mark_all_notifications_read(
    user_email: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Marca todas as notificações do usuário como lidas.
    Corresponde a PUT /api/notifications/read-all no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='user_email é obrigatório',
        )

    await db.notifications.update_many(
        {'user_email': user_email, 'is_read': False},
        {'$set': {'is_read': True}},
    )

    return {'message': 'Notificações marcadas como lidas'}


# Deletar notificação
@router.delete('/{notification_id}')
async def delete_notification(
    notification_id: str,
    _: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Deleta uma notificação.
    Corresponde a DELETE /api/notifications/:id no Node.js.
    """
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='MongoDB não conectado',
        )

    result = await db.notifications.find_one_and_delete({'id': notification_id})

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Notificação não encontrada',
        )

    return {'message': 'Notificação deletada'}
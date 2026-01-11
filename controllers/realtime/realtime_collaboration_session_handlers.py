from flask import request
from flask_socketio import emit, join_room, leave_room, disconnect
from pydantic import ValidationError

from controllers.realtime.realtime_collaboration_constants import (
    COLLABORATION_NAMESPACE,
    EVENT_COLLABORATION,
    EVENT_SESSION,
    ROOM_PREFIX,
)
from dtos.collaboration_dto import JoinCollaborationDTO, LeaveCollaborationDTO
from services.impl.realtime.realtime_collaboration_service_impl import (
    realtime_collaboration_service,
)
from services.impl.realtime.socketio_auth_service_impl import socketio_auth_service
from utils.logger import logger
from utils.rate_limiter import socketio_rate_limit


def register_collaboration_session_handlers(socketio):
    @socketio.on("connect", namespace=COLLABORATION_NAMESPACE)
    def handle_connect(auth=None):
        user_id, _ = socketio_auth_service.get_current_user_context_from_socket(auth)

        if not user_id:
            disconnect()
            return False

        return True

    @socketio.on("disconnect", namespace=COLLABORATION_NAMESPACE)
    def handle_disconnect(reason=None):
        socket_id = request.sid
        event = realtime_collaboration_service.handle_disconnect(socket_id)

        if event:
            emit(
                EVENT_COLLABORATION,
                event.model_dump(mode="json"),
                room=f"{ROOM_PREFIX}{event.note_id}",
                skip_sid=socket_id,
                namespace=COLLABORATION_NAMESPACE,
            )

    @socketio.on("join_collaboration", namespace=COLLABORATION_NAMESPACE)
    @socketio_rate_limit(
        max_requests=100, window_seconds=60, disconnect_on_exceed=False
    )  # 100 joins per minute
    def handle_join_collaboration(data):
        user_id, user_role = socketio_auth_service.get_current_user_context_from_socket()
        try:
            join_dto = JoinCollaborationDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(
                f"Invalid join_collaboration payload from user {user_id}: {exc}"
            )
            return

        socket_id = request.sid

        session_dto, join_event = (
            realtime_collaboration_service.join_collaboration_session(
                note_id=join_dto.note_id,
                user_id=user_id,
                user_role=user_role,
                socket_id=socket_id,
                initial_content=join_dto.content,
            )
        )

        join_room(f"{ROOM_PREFIX}{join_dto.note_id}")
        emit(EVENT_SESSION, session_dto.model_dump(mode="json"), room=request.sid)

        emit(
            EVENT_COLLABORATION,
            join_event.model_dump(mode="json"),
            room=f"{ROOM_PREFIX}{join_dto.note_id}",
            skip_sid=socket_id,
            namespace=COLLABORATION_NAMESPACE,
        )

    @socketio.on("leave_collaboration", namespace=COLLABORATION_NAMESPACE)
    def handle_leave_collaboration(data):
        user_id = socketio_auth_service.get_current_user_from_socket()
        try:
            leave_dto = LeaveCollaborationDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(
                f"Invalid leave_collaboration payload from user {user_id}: {exc}"
            )
            return

        note_id = leave_dto.note_id
        socket_id = request.sid

        event = realtime_collaboration_service.leave_collaboration_session(
            note_id=note_id, user_id=user_id, socket_id=socket_id
        )

        if event:
            room_note_id = event.note_id or note_id
            leave_room(f"{ROOM_PREFIX}{room_note_id}")

            emit(
                EVENT_COLLABORATION,
                event.model_dump(mode="json"),
                room=f"{ROOM_PREFIX}{room_note_id}",
                skip_sid=socket_id,
                namespace=COLLABORATION_NAMESPACE,
            )

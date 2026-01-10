from flask import request
from flask_socketio import emit, join_room, leave_room, disconnect
from pydantic import ValidationError

from domain_services.socketio_auth_domain_service import (
    get_current_user_context_from_socket,
    get_current_user_from_socket,
)
from dtos.collaboration_dto import (
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
    JoinCollaborationDTO,
    LeaveCollaborationDTO,
)
from services.impl.realtime.realtime_collaboration_service_impl import (
    realtime_collaboration_service,
)
from utils.socketio_service import get_socketio
from utils.rate_limiter import socketio_rate_limit
from utils.logger import get_logger

COLLABORATION_NAMESPACE = "/collaboration"
ROOM_PREFIX = "note_"
EVENT_COLLABORATION = "collaboration_event"
EVENT_SESSION = "collaboration_session"
EVENT_CRDT_SYNC_REPLY = "crdt_sync_reply"

logger = get_logger(__name__)


def register_socketio_handlers():
    socketio = get_socketio()

    @socketio.on("connect", namespace=COLLABORATION_NAMESPACE)
    def handle_connect(auth=None):
        user_id, _ = get_current_user_context_from_socket(auth)

        if not user_id:
            disconnect()
            return False

        return True

    @socketio.on("disconnect", namespace=COLLABORATION_NAMESPACE)
    def handle_disconnect():
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
    @socketio_rate_limit(max_requests=20, window_seconds=60)  # 20 joins per minute
    def handle_join_collaboration(data):
        user_id, user_role = get_current_user_context_from_socket()
        try:
            join_dto = JoinCollaborationDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(
                f"Invalid join_collaboration payload from user {user_id}: {exc}"
            )
            return

        socket_id = request.sid

        session_dto, join_event = realtime_collaboration_service.join_collaboration_session(
            note_id=join_dto.note_id,
            user_id=user_id,
            user_role=user_role,
            socket_id=socket_id,
            initial_content=join_dto.content,
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
        user_id = get_current_user_from_socket()
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

    @socketio.on("crdt_update", namespace=COLLABORATION_NAMESPACE)
    @socketio_rate_limit(max_requests=100, window_seconds=60)  # 100 updates per minute
    def handle_crdt_update(data):
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id:
            logger.warning(
                f"CRDT update rejected: No authenticated user (socket={request.sid})"
            )
            return

        try:
            crdt_update_dto = CRDTUpdateDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(
                f"Invalid CRDT update payload from user {user_id}: {exc}"
            )
            return

        event = realtime_collaboration_service.process_crdt_update(
            update_dto=crdt_update_dto,
            user_id=user_id,
            user_role=user_role,
            username=realtime_collaboration_service.get_username_by_socket(request.sid),
        )

        emit(
            EVENT_COLLABORATION,
            event.model_dump(mode="json"),
            room=f"{ROOM_PREFIX}{crdt_update_dto.note_id}",
            skip_sid=request.sid,
            namespace=COLLABORATION_NAMESPACE,
        )

    @socketio.on("crdt_sync_request", namespace=COLLABORATION_NAMESPACE)
    @socketio_rate_limit(max_requests=30, window_seconds=60)  # 30 sync requests per minute
    def handle_crdt_sync_request(data):
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id:
            logger.warning(
                f"CRDT sync request rejected: No authenticated user (socket={request.sid})"
            )
            return

        try:
            sync_request_dto = CRDTSyncRequestDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(
                f"Invalid CRDT sync request payload from user {user_id}: {exc}"
            )
            return

        state_vector, update = realtime_collaboration_service.handle_crdt_sync_request(
            sync_request_dto=sync_request_dto,
            user_id=user_id,
            user_role=user_role,
        )

        emit(
            EVENT_CRDT_SYNC_REPLY,
            {
                "note_id": sync_request_dto.note_id,
                "state_vector": state_vector,
                "update": update,
            },
            room=request.sid,
        )

from flask import request
from flask_socketio import emit
from pydantic import ValidationError

from controllers.realtime.realtime_collaboration_constants import (
    COLLABORATION_NAMESPACE,
    EVENT_COLLABORATION,
    EVENT_CRDT_SYNC_REPLY,
    ROOM_PREFIX,
)
from dtos.collaboration_dto import CRDTUpdateDTO, CRDTSyncRequestDTO
from services.impl.realtime.realtime_collaboration_service_impl import (
    realtime_collaboration_service,
)
from services.impl.realtime.socketio_auth_service_impl import socketio_auth_service
from utils.logger import get_logger
from utils.rate_limiter import socketio_rate_limit

logger = get_logger(__name__)


def register_collaboration_crdt_handlers(socketio):
    @socketio.on("crdt_update", namespace=COLLABORATION_NAMESPACE)
    @socketio_rate_limit(max_requests=100, window_seconds=60)  # 100 updates per minute
    def handle_crdt_update(data):
        user_id, user_role = socketio_auth_service.get_current_user_context_from_socket()
        if not user_id:
            logger.warning(
                f"CRDT update rejected: No authenticated user (socket={request.sid})"
            )
            return

        try:
            crdt_update_dto = CRDTUpdateDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(f"Invalid CRDT update payload from user {user_id}: {exc}")
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
        user_id, user_role = socketio_auth_service.get_current_user_context_from_socket()
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

from flask import request
from flask_socketio import emit
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

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
from utils.logger import logger


def register_collaboration_crdt_handlers(socketio):
    @socketio.on("crdt_update", namespace=COLLABORATION_NAMESPACE)
    def handle_crdt_update(data):
        user_id, user_role = socketio_auth_service.get_current_user_context_from_socket()
        if not user_id:
            logger.warning(
                f"CRDT update rejected: No authenticated user (socket={request.sid})"
            )
            emit("error", {"message": "Not authenticated", "code": "UNAUTHORIZED"}, room=request.sid)
            return

        try:
            crdt_update_dto = CRDTUpdateDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(
                f"Invalid CRDT update payload from user {user_id}: {exc}")
            emit("error", {"message": "Invalid payload", "code": "INVALID_PAYLOAD"}, room=request.sid)
            return

        try:
            event = realtime_collaboration_service.process_crdt_update(
                update_dto=crdt_update_dto,
                user_id=user_id,
                user_role=user_role,
                username=realtime_collaboration_service.get_username_by_socket(
                    request.sid),
            )
        except HTTPException as exc:
            logger.warning(
                f"Failed CRDT update for user {user_id} on note {crdt_update_dto.note_id}: {exc.description}"
            )
            emit("error", {"message": exc.description, "code": exc.name}, room=request.sid)
            return
        except Exception as exc:
            logger.error(
                f"Unexpected error in CRDT update for user {user_id} on note {crdt_update_dto.note_id}: {exc}"
            )
            emit("error", {"message": "Internal server error", "code": "INTERNAL_ERROR"}, room=request.sid)
            return

        emit(
            EVENT_COLLABORATION,
            event.model_dump(mode="json"),
            room=f"{ROOM_PREFIX}{crdt_update_dto.note_id}",
            skip_sid=request.sid,
            namespace=COLLABORATION_NAMESPACE,
        )

    @socketio.on("crdt_sync_request", namespace=COLLABORATION_NAMESPACE)
    def handle_crdt_sync_request(data):
        user_id, user_role = socketio_auth_service.get_current_user_context_from_socket()
        if not user_id:
            logger.warning(
                f"CRDT sync request rejected: No authenticated user (socket={request.sid})"
            )
            emit("error", {"message": "Not authenticated", "code": "UNAUTHORIZED"}, room=request.sid)
            return

        try:
            sync_request_dto = CRDTSyncRequestDTO.model_validate(data)
        except ValidationError as exc:
            logger.error(
                f"Invalid CRDT sync request payload from user {user_id}: {exc}"
            )
            emit("error", {"message": "Invalid payload", "code": "INVALID_PAYLOAD"}, room=request.sid)
            return

        try:
            state_vector, update = realtime_collaboration_service.handle_crdt_sync_request(
                sync_request_dto=sync_request_dto,
                user_id=user_id,
                user_role=user_role,
            )
        except HTTPException as exc:
            logger.warning(
                f"Failed CRDT sync request for user {user_id} on note {sync_request_dto.note_id}: {exc.description}"
            )
            emit("error", {"message": exc.description, "code": exc.name}, room=request.sid)
            return
        except Exception as exc:
            logger.error(
                f"Unexpected error in CRDT sync request for user {user_id} on note {sync_request_dto.note_id}: {exc}"
            )
            emit("error", {"message": "Internal server error", "code": "INTERNAL_ERROR"}, room=request.sid)
            return

        emit(
            EVENT_CRDT_SYNC_REPLY,
            {
                "note_id": sync_request_dto.note_id,
                "state_vector": state_vector,
                "update": update,
            },
            room=request.sid,
        )

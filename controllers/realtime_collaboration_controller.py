from flask import request
from flask_socketio import emit, join_room, leave_room, disconnect
from domain_services.socketio_auth_domain_service import (
    get_current_user_context_from_socket,
    get_current_user_from_socket,
)
from domain_services.realtime_collaboration_domain_service import (
    realtime_collaboration_domain_service,
)
from dtos.collaboration_dto import (
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
)
from utils.socketio_service import get_socketio
from utils.rate_limiter import socketio_rate_limit
from utils.logger import get_logger

# Constants
COLLABORATION_NAMESPACE = "/collaboration"
ROOM_PREFIX = "note_"
EVENT_COLLABORATION = "collaboration_event"
EVENT_SESSION = "collaboration_session"
EVENT_CRDT_SYNC_REPLY = "crdt_sync_reply"

logger = get_logger(__name__)


def _validate_join_collaboration_data(data: dict, user_id: str) -> tuple[str | None, str | None]:
    """
    Validate join_collaboration input data.

    Returns:
        Tuple of (note_id, initial_content) if valid, (None, None) if invalid
    """
    if not isinstance(data, dict):
        logger.error(f"Invalid join_collaboration data type from user {user_id}: {type(data)}")
        return None, None

    note_id = data.get("note_id")
    initial_content = data.get("content")

    # Validate note_id
    if not note_id or not isinstance(note_id, str):
        logger.error(f"Missing or invalid note_id from user {user_id}")
        return None, None

    # Validate note_id length to prevent abuse
    if len(note_id) > 36:
        logger.error(f"note_id too long from user {user_id}: {len(note_id)} chars")
        return None, None

    # Validate initial_content if provided
    if initial_content is not None:
        if not isinstance(initial_content, str):
            logger.error(f"Invalid initial_content type from user {user_id}: {type(initial_content)}")
            return None, None

        # Limit initial content size to prevent memory issues
        if len(initial_content) > 10485760:  # 10MB max
            logger.error(f"initial_content too large from user {user_id}: {len(initial_content)} chars")
            return None, None

    return note_id, initial_content

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
        event = realtime_collaboration_domain_service.handle_disconnect(socket_id)

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

        note_id, initial_content = _validate_join_collaboration_data(data, user_id)
        if note_id is None:
            return

        socket_id = request.sid

        session_dto, join_event = realtime_collaboration_domain_service.join_collaboration_session(
            note_id=note_id,
            user_id=user_id,
            user_role=user_role,
            socket_id=socket_id,
            initial_content=initial_content,
        )

        join_room(f"{ROOM_PREFIX}{note_id}")
        emit(EVENT_SESSION, session_dto.model_dump(mode="json"), room=request.sid)

        emit(
            EVENT_COLLABORATION,
            join_event.model_dump(mode="json"),
            room=f"{ROOM_PREFIX}{note_id}",
            skip_sid=socket_id,
            namespace=COLLABORATION_NAMESPACE,
        )

    @socketio.on("leave_collaboration", namespace=COLLABORATION_NAMESPACE)
    def handle_leave_collaboration(data):
        user_id = get_current_user_from_socket()

        note_id = data.get("note_id")
        socket_id = request.sid

        event = realtime_collaboration_domain_service.leave_collaboration_session(
            note_id=note_id, user_id=user_id, socket_id=socket_id
        )

        if event:
            leave_room(f"{ROOM_PREFIX}{note_id}")

            emit(
                EVENT_COLLABORATION,
                event.model_dump(mode="json"),
                room=f"{ROOM_PREFIX}{note_id}",
                skip_sid=socket_id,
                namespace=COLLABORATION_NAMESPACE,
            )

    @socketio.on("crdt_update", namespace=COLLABORATION_NAMESPACE)
    @socketio_rate_limit(max_requests=100, window_seconds=60)  # 100 updates per minute
    def handle_crdt_update(data):
        """Handles CRDT update from a client."""
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id:
            logger.warning(f"CRDT update rejected: No authenticated user (socket={request.sid})")
            return

        try:
            crdt_update_dto = CRDTUpdateDTO.model_validate(data)
        except Exception as e:
            logger.error(f"Invalid CRDT update payload from user {user_id}: {str(e)}")
            return

        # Traiter la mise à jour CRDT
        event = realtime_collaboration_domain_service.process_crdt_update(
            update_dto=crdt_update_dto,
            user_id=user_id,
            user_role=user_role,
            username=realtime_collaboration_domain_service.get_username_by_socket(request.sid),
        )

        # Diffuser la mise à jour à tous les autres clients
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
        """Handles CRDT synchronization request from a client."""
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id:
            logger.warning(f"CRDT sync request rejected: No authenticated user (socket={request.sid})")
            return

        try:
            sync_request_dto = CRDTSyncRequestDTO.model_validate(data)
        except Exception as e:
            logger.error(f"Invalid CRDT sync request payload from user {user_id}: {str(e)}")
            return

        # Gérer la demande de synchronisation
        state_vector, update = realtime_collaboration_domain_service.handle_crdt_sync_request(
            sync_request_dto=sync_request_dto, user_id=user_id, user_role=user_role
        )

        # Répondre uniquement au client qui a fait la demande
        emit(
            EVENT_CRDT_SYNC_REPLY,
            {
                "note_id": sync_request_dto.note_id,
                "state_vector": state_vector,
                "update": update,
            },
            room=request.sid,
        )

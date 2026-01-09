from flask import request, session as flask_session
from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect
from flask_jwt_extended import decode_token
from pydantic import ValidationError

from daos.note_dao import Note
from daos.user_dao import User
from domain_services import collaboration_domain_service
from domain_services.permission_domain_service import permission_domain_service
from dtos.collaboration_dto import (
    CollaborationEventDTO,
    CollaborationOperationDTO,
    SendOperationDTO,
    CursorPositionDTO,
    TypingStatusDTO,
)
from exceptions.collaboration_exception import (
    CollaborationSessionAlreadyExists,
    CollaborationNotAuthorized,
    CollaborationInvalidOperation,
    CollaborationVersionConflict,
)
from repositorys import collaboration_repository
from utils.db import get_db_session
from utils.logger import get_logger
from utils.enums import RoleEnum

logger = get_logger(__name__)
DEFAULT_EMPTY_DOCUMENT = '{"type":"doc","content":[{"type":"paragraph"}]}'
ERROR_INTERNAL_SERVER = "ERROR_INTERNAL_SERVER"

# SocketIO instance will be initialized in app.py
socketio = SocketIO()


def _strip_bearer(token: str | None) -> str | None:
    if not token:
        return None
    return token.replace("Bearer ", "", 1) if token.startswith("Bearer ") else token


def _extract_token_from_auth(auth) -> str | None:
    if not auth:
        return None
    if isinstance(auth, dict):
        return _strip_bearer(auth.get("token") or auth.get("access_token"))
    if isinstance(auth, str):
        return _strip_bearer(auth)
    return None


def _parse_role(raw_role: str | None) -> RoleEnum | None:
    if not raw_role:
        return None
    try:
        return RoleEnum(raw_role)
    except ValueError:
        return None


def get_current_user_context_from_socket(auth=None) -> tuple[str | None, RoleEnum | None]:
    """Extracts user info from socket connection auth or cached socket data."""
    try:
        cached_user_id = flask_session.get("collaboration_user_id")
        cached_role = _parse_role(flask_session.get("collaboration_user_role"))
        if cached_user_id and cached_role:
            return cached_user_id, cached_role

        cached_user_id = request.environ.get("collaboration_user_id")
        cached_role = _parse_role(request.environ.get("collaboration_user_role"))
        if cached_user_id and cached_role:
            return cached_user_id, cached_role

        token = _extract_token_from_auth(auth)
        if not token:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header.replace("Bearer ", "", 1)

        if not token:
            token = _strip_bearer(request.args.get("token"))

        if not token:
            return None, None

        decoded = decode_token(token)
        user_id = decoded.get("sub")
        user_role = _parse_role(decoded.get("role"))
        if user_id:
            request.environ["collaboration_user_id"] = user_id
            flask_session["collaboration_user_id"] = user_id
        if user_role:
            request.environ["collaboration_user_role"] = user_role.value
            flask_session["collaboration_user_role"] = user_role.value
        return user_id, user_role
    except Exception as e:
        logger.error(f"Error decoding token from socket: {e}")
        return None, None


def get_current_user_from_socket(auth=None) -> str | None:
    user_id, _ = get_current_user_context_from_socket(auth)
    return user_id


def get_current_user_role_from_socket(auth=None) -> RoleEnum | None:
    _, user_role = get_current_user_context_from_socket(auth)
    return user_role


@socketio.on("connect", namespace="/collaboration")
def handle_connect(auth=None):
    """Handles client connection to collaboration namespace."""
    user_id, _ = get_current_user_context_from_socket(auth)

    if not user_id:
        logger.warning("Unauthenticated connection attempt")
        disconnect()
        return False

    logger.info(f"User {user_id} connected to collaboration namespace")
    return True


@socketio.on("disconnect", namespace="/collaboration")
def handle_disconnect():
    """Handles client disconnection."""
    try:
        socket_id = request.sid
        session_data = collaboration_repository.find_session_by_socket(socket_id)

        if session_data:
            note_id = session_data.get("note_id")
            user_id = session_data.get("user_id")
            username = session_data.get("username")

            collaboration_repository.delete_session_by_socket(socket_id)

            event = CollaborationEventDTO(
                event_type="user_left",
                user_id=user_id,
                username=username,
                note_id=note_id,
            )

            emit(
                "collaboration_event",
                event.model_dump(mode="json"),
                room=f"note_{note_id}",
                skip_sid=socket_id,
                namespace="/collaboration",
            )

            logger.info(
                f"User {user_id} disconnected from collaboration on note {note_id}"
            )
    except Exception as e:
        logger.error(f"Error handling disconnect: {e}")


@socketio.on("join_collaboration", namespace="/collaboration")
def handle_join_collaboration(data):
    """Handles a user joining a collaboration session on a note."""
    try:
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id or not user_role:
            emit("error", {"code": 401, "message": "Unauthorized", "type": "unauthorized"})
            return

        note_id = data.get("note_id")
        if not note_id:
            emit("error", {"code": 400, "message": "note_id is required", "type": "validation_error"})
            return

        with get_db_session() as session:
            note = session.get(Note, note_id)
            if not note:
                emit("error", {"code": 404, "message": "Note not found", "type": "not_found"})
                return

            if not (note.content or "").strip():
                initial_content = data.get("content")
                note.content = initial_content or DEFAULT_EMPTY_DOCUMENT

            has_permission = permission_domain_service.can_read_note(
                note_id, user_id, user_role
            )
            if not has_permission:
                raise CollaborationNotAuthorized()

            user = session.get(User, user_id)
            if not user:
                emit("error", {"code": 404, "message": "User not found", "type": "not_found"})
                return
            username = user.username

        existing_sessions = collaboration_repository.list_sessions_by_note(note_id)
        stale_socket_ids = [
            session_item.get("socket_id")
            for session_item in existing_sessions
            if session_item.get("user_id") == user_id
        ]
        if stale_socket_ids:
            logger.info(
                f"Cleaning up existing collaboration sessions for user {user_id} on note {note_id}"
            )
            for stale_socket_id in stale_socket_ids:
                if not stale_socket_id:
                    continue
                try:
                    socketio.server.disconnect(stale_socket_id, namespace="/collaboration")
                except Exception as e:
                    logger.warning(
                        f"Failed to disconnect stale socket {stale_socket_id}: {e}"
                    )
                collaboration_repository.delete_session_by_socket(stale_socket_id)

        socket_id = request.sid
        collaboration_repository.create_session(
            note_id, user_id, socket_id, username
        )

        join_room(f"note_{note_id}")

        all_sessions = collaboration_repository.list_sessions_by_note(note_id)
        current_version = collaboration_repository.get_latest_version_for_note(
            note_id
        )
        session_dto = collaboration_domain_service.build_session_dto_from_redis(
            note_id, all_sessions, note.content, current_version
        )

        emit(
            "collaboration_session",
            session_dto.model_dump(mode="json"),
            room=request.sid,
        )

        event = CollaborationEventDTO(
            event_type="user_joined",
            user_id=user_id,
            username=username,
            note_id=note_id,
        )

        emit(
            "collaboration_event",
            event.model_dump(mode="json"),
            room=f"note_{note_id}",
            skip_sid=socket_id,
            namespace="/collaboration",
        )

        logger.info(f"User {user_id} joined collaboration on note {note_id}")

    except CollaborationSessionAlreadyExists as e:
        emit("error", {"code": 409, "message": str(e), "type": "session_exists"})
    except CollaborationNotAuthorized as e:
        emit("error", {"code": 403, "message": str(e), "type": "forbidden"})
    except Exception as e:
        logger.error(f"Error joining collaboration: {e}")
        emit("error", {"code": 500, "message": ERROR_INTERNAL_SERVER, "type": "internal_error"})


@socketio.on("leave_collaboration", namespace="/collaboration")
def handle_leave_collaboration(data):
    """Handles a user leaving a collaboration session."""
    try:
        user_id = get_current_user_from_socket()
        if not user_id:
            emit("error", {"code": 401, "message": "Unauthorized", "type": "unauthorized"})
            return

        note_id = data.get("note_id")
        if not note_id:
            emit("error", {"code": 400, "message": "note_id is required", "type": "validation_error"})
            return

        socket_id = request.sid
        session_data = collaboration_repository.find_session_by_socket(socket_id)

        if session_data:
            collaboration_repository.delete_session_by_socket(socket_id)
            leave_room(f"note_{note_id}")

            event = CollaborationEventDTO(
                event_type="user_left",
                user_id=user_id,
                username=session_data.get("username"),
                note_id=note_id,
            )

            emit(
                "collaboration_event",
                event.model_dump(mode="json"),
                room=f"note_{note_id}",
                skip_sid=socket_id,
                namespace="/collaboration",
            )

            logger.info(f"User {user_id} left collaboration on note {note_id}")

    except Exception as e:
        logger.error(f"Error leaving collaboration: {e}")
        emit("error", {"code": 500, "message": ERROR_INTERNAL_SERVER, "type": "internal_error"})


@socketio.on("send_operation", namespace="/collaboration")
def handle_send_operation(data):
    """Handles a collaborative editing operation."""
    try:
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id or not user_role:
            emit("error", {"code": 401, "message": "Unauthorized", "type": "unauthorized"})
            return

        try:
            operation_dto = SendOperationDTO.model_validate(data)
        except ValidationError as e:
            emit("error", {"code": 400, "message": f"Invalid operation data: {e}", "type": "validation_error"})
            return

        with get_db_session() as session_db:
            note = session_db.get(Note, operation_dto.note_id)
            if not note:
                emit("error", {"code": 404, "message": "Note not found", "type": "not_found"})
                return

            has_permission = permission_domain_service.can_write_note(
                operation_dto.note_id, user_id, user_role
            )
            if not has_permission:
                emit("error", {"code": 403, "message": "Write permission required", "type": "forbidden"})
                return

            current_version = collaboration_repository.get_latest_version_for_note(
                operation_dto.note_id
            )

            content_len = len(note.content) if note.content else 0
            logger.info(
                f"Validating operation: type={operation_dto.operation.operation_type}, "
                f"position={operation_dto.operation.position}, "
                f"content_length={content_len}, "
                f"operation_content_len={len(operation_dto.operation.content) if operation_dto.operation.content else 0}, "
                f"operation_length={operation_dto.operation.length}, "
                f"operation_version={operation_dto.operation.version}, "
                f"current_version={current_version}"
            )

            # Check version conflict before validation
            if operation_dto.operation.version != current_version + 1:
                logger.warning(
                    f"Version conflict: operation version={operation_dto.operation.version}, "
                    f"expected version={current_version + 1}"
                )
                raise CollaborationVersionConflict(current_version + 1, operation_dto.operation.version)

            collaboration_domain_service.validate_operation(
                operation_dto.operation, content_len, current_version
            )

            new_version = collaboration_repository.increment_version_for_note(
                operation_dto.note_id
            )
            operation_dto.operation.version = new_version

            new_content = collaboration_domain_service.apply_operation(
                note.content, operation_dto.operation
            )
            note.content = new_content

        # Store in Redis
        collaboration_repository.store_operation_in_redis(
            note_id=operation_dto.note_id,
            user_id=user_id,
            operation_type=operation_dto.operation.operation_type,
            position=operation_dto.operation.position,
            content=operation_dto.operation.content,
            length=operation_dto.operation.length,
            version=operation_dto.operation.version,
        )

        socket_id = request.sid
        session_data = collaboration_repository.find_session_by_socket(socket_id)
        username = session_data.get("username") if session_data else "Unknown"

        event = CollaborationEventDTO(
            event_type="content_changed",
            user_id=user_id,
            username=username,
            note_id=operation_dto.note_id,
            operation=operation_dto.operation,
        )

        emit(
            "collaboration_event",
            event.model_dump(mode="json"),
            room=f"note_{operation_dto.note_id}",
            skip_sid=socket_id,
            namespace="/collaboration",
        )

        emit("operation_acknowledged", {"version": operation_dto.operation.version})

    except CollaborationVersionConflict as e:
        # Send current version to help client recover from conflict
        current_version = collaboration_repository.get_latest_version_for_note(
            operation_dto.note_id
        )
        logger.info(f"Sending version conflict response with current_version={current_version}")
        emit("error", {
            "code": 409,
            "message": str(e),
            "type": "version_conflict",
            "current_version": current_version
        })
    except CollaborationInvalidOperation as e:
        emit("error", {"code": 400, "message": str(e), "type": "invalid_operation"})
    except Exception as e:
        logger.error(f"Error processing operation: {e}")
        emit("error", {"code": 500, "message": ERROR_INTERNAL_SERVER, "type": "internal_error"})


@socketio.on("cursor_position", namespace="/collaboration")
def handle_cursor_position(data):
    """Handles cursor position updates."""
    try:
        user_id = get_current_user_from_socket()
        if not user_id:
            return

        try:
            cursor_dto = CursorPositionDTO.model_validate(data)
        except ValidationError:
            return

        socket_id = request.sid
        session_data = collaboration_repository.find_session_by_socket(socket_id)
        if not session_data:
            return

        username = session_data.get("username")

        # Store cursor position in Redis
        collaboration_repository.set_cursor_position(
            cursor_dto.note_id, user_id, cursor_dto.position
        )

        event = CollaborationEventDTO(
            event_type="cursor_moved",
            user_id=user_id,
            username=username,
            note_id=cursor_dto.note_id,
            cursor_position=cursor_dto.position,
        )

        emit(
            "collaboration_event",
            event.model_dump(mode="json"),
            room=f"note_{cursor_dto.note_id}",
            skip_sid=socket_id,
            namespace="/collaboration",
        )

    except Exception as e:
        logger.error(f"Error handling cursor position: {e}")


@socketio.on("typing_status", namespace="/collaboration")
def handle_typing_status(data):
    """Handles typing status updates."""
    try:
        user_id = get_current_user_from_socket()
        if not user_id:
            return

        try:
            typing_dto = TypingStatusDTO.model_validate(data)
        except ValidationError:
            return

        socket_id = request.sid
        session_data = collaboration_repository.find_session_by_socket(socket_id)
        if not session_data:
            return

        username = session_data.get("username")
        event_type = "user_typing" if typing_dto.is_typing else "user_stopped_typing"

        # Store typing status in Redis
        collaboration_repository.set_typing_status(
            typing_dto.note_id, user_id, typing_dto.is_typing
        )

        event = CollaborationEventDTO(
            event_type=event_type,
            user_id=user_id,
            username=username,
            note_id=typing_dto.note_id,
        )

        emit(
            "collaboration_event",
            event.model_dump(mode="json"),
            room=f"note_{typing_dto.note_id}",
            skip_sid=socket_id,
            namespace="/collaboration",
        )

    except Exception as e:
        logger.error(f"Error handling typing status: {e}")

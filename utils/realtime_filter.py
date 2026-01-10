from flask import request
from flask_socketio import SocketIO, emit
from flask_jwt_extended.exceptions import JWTExtendedException
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

from exceptions.collaboration_exception import (
    CollaborationInvalidOperation,
    CollaborationNotAuthorized,
    CollaborationVersionConflict,
)
from utils.filter import GENERIC_MESSAGE
from utils.logger import get_logger


def _build_error_payload(error: Exception) -> dict:
    if isinstance(error, CollaborationNotAuthorized):
        return {"code": 403, "message": str(error), "type": "forbidden"}

    if isinstance(error, CollaborationInvalidOperation):
        return {"code": 400, "message": str(error), "type": "invalid_operation"}

    if isinstance(error, CollaborationVersionConflict):
        payload = {"code": 409, "message": "Version conflict", "type": "version_conflict"}
        expected_version = getattr(error, "expected_version", None)
        if expected_version is not None:
            payload["current_version"] = max(expected_version - 1, 0)
        return payload

    if isinstance(error, ValueError):
        return {"code": 404, "message": str(error), "type": "not_found"}

    if isinstance(error, ValidationError):
        return {"code": 400, "message": f"Invalid data: {error}", "type": "validation_error"}

    if isinstance(error, JWTExtendedException):
        return {"code": 401, "message": "Unauthorized", "type": "unauthorized"}

    if isinstance(error, HTTPException):
        status_code = int(error.code) if error.code is not None else 500
        return {"code": status_code, "message": str(error), "type": "http_error"}

    return {"code": 500, "message": GENERIC_MESSAGE, "type": "internal_error"}


def _get_event_name() -> str | None:
    event = getattr(request, "event", None)
    if isinstance(event, (list, tuple)) and event:
        return event[0]
    return None


def register_realtime_filter(socketio: SocketIO) -> None:
    logger = get_logger("realtime")

    @socketio.on_error("/collaboration")
    def handle_collaboration_error(error: Exception):
        event_name = _get_event_name()
        error_payload = _build_error_payload(error)
        emit("error", error_payload, namespace="/collaboration")
        logger.error(
            "Realtime error: %s | sid=%s | namespace=%s | event=%s",
            error,
            getattr(request, "sid", None),
            getattr(request, "namespace", None),
            event_name,
            exc_info=True,
        )

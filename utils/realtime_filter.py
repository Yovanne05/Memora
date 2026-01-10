from flask_socketio import SocketIO, emit
from flask_jwt_extended.exceptions import JWTExtendedException
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

from exceptions.collaboration_exception import (
    CollaborationInvalidOperation,
    CollaborationNotAuthorized,
)
from utils.filter import GENERIC_MESSAGE


def _build_error_payload(error: Exception) -> dict:
    if isinstance(error, CollaborationNotAuthorized):
        return {"code": 403, "message": str(error), "type": "forbidden"}

    if isinstance(error, CollaborationInvalidOperation):
        return {"code": 400, "message": str(error), "type": "invalid_operation"}

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


def register_realtime_filter(socketio: SocketIO) -> None:
    @socketio.on_error("/collaboration")
    def handle_collaboration_error(error: Exception):
        error_payload = _build_error_payload(error)
        emit("error", error_payload, namespace="/collaboration")

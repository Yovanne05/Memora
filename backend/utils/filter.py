from http import HTTPStatus
from flask import jsonify, request, g
from flask_jwt_extended.exceptions import JWTExtendedException
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError

from exceptions.permission_exception import PermissionException

GENERIC_MESSAGE = "Une erreur est survenue. Merci de réessayer plus tard."


def register_global_filter(app):
    @app.errorhandler(Exception)
    def handle_any_exception(error: Exception):
        if isinstance(error, PermissionException):
            status_code = int(HTTPStatus.FORBIDDEN)
            message = str(error)
        elif isinstance(error, HTTPException):
            status_code = int(error.code)
            message = error.description
        elif isinstance(error, ValidationError):
            status_code = int(HTTPStatus.UNPROCESSABLE_ENTITY)
            message = "Données invalides"
        elif isinstance(error, JWTExtendedException):
            status_code = int(HTTPStatus.UNAUTHORIZED)
            message = "Non autorisé"
        else:
            status_code = int(HTTPStatus.INTERNAL_SERVER_ERROR)
            message = GENERIC_MESSAGE
            app.logger.error(f"Unhandled exception: {str(error)}", exc_info=True)
        if status_code == int(HTTPStatus.FORBIDDEN):
            current_user = getattr(g, "current_user", None)
            user_id = getattr(current_user, "id", None)
            app.logger.warning(
                "Access denied user_id=%s method=%s path=%s",
                user_id or "unknown",
                request.method,
                request.path,
            )
        return jsonify({"code": status_code, "message": message}), status_code

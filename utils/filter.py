from http import HTTPStatus
from flask import jsonify
from flask_jwt_extended.exceptions import JWTExtendedException
from flask_limiter.errors import RateLimitExceeded
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError

import config

GENERIC_MESSAGE = "Une erreur est survenue. Merci de réessayer plus tard."
RATE_LIMIT_MESSAGE = "Trop de requetes. Reessayez plus tard."


def register_global_filter(app):
    @app.errorhandler(Exception)
    def handle_any_exception(error: Exception):
        if isinstance(error, RateLimitExceeded):
            status_code = int(HTTPStatus.TOO_MANY_REQUESTS)
            if config.APP_ENV == "prod":
                message = RATE_LIMIT_MESSAGE
            else:
                message = error.description
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
        return jsonify({"code": status_code, "message": message}), status_code

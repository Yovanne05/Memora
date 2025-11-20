from http import HTTPStatus
from flask import jsonify
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError

GENERIC_MESSAGE = "Une erreur est survenue. Merci de réessayer plus tard."


def register_global_filter(app):
    @app.errorhandler(Exception)
    def handle_any_exception(error: Exception):
        if isinstance(error, HTTPException):
            status_code = int(error.code)
        elif isinstance(error, ValidationError):
            status_code = int(HTTPStatus.UNPROCESSABLE_ENTITY)
        else:
            status_code = int(HTTPStatus.INTERNAL_SERVER_ERROR)

        return jsonify({
            "code": status_code,
            "message": f"{GENERIC_MESSAGE} - {str(error)}"
        }), status_code
from __future__ import annotations

from flask import g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from werkzeug.exceptions import Unauthorized

from repositorys import user_repository


class AuthenticatedUserNotFound(Unauthorized):
    def __init__(self, description: str = "User not found or deactivated."):
        super().__init__(description=description)


def _load_user_from_token():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    if not user_id:
        raise Unauthorized()

    user = user_repository.find_one(str(user_id))
    if not user:
        raise AuthenticatedUserNotFound()
    return user


def get_current_user():
    if hasattr(g, "current_user") and g.current_user:
        return g.current_user

    user = _load_user_from_token()
    g.current_user = user
    return user

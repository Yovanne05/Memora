from flask import request, session as flask_session
from flask_jwt_extended import decode_token
from utils.enums import RoleEnum


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


def _cache_user_context(user_id: str | None, user_role: RoleEnum | None) -> None:
    if user_id:
        request.environ["collaboration_user_id"] = user_id
        flask_session["collaboration_user_id"] = user_id
    if user_role:
        request.environ["collaboration_user_role"] = user_role.value
        flask_session["collaboration_user_role"] = user_role.value


def get_current_user_context_from_socket(auth=None) -> tuple[str | None, RoleEnum | None]:
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
        return None, None

    decoded = decode_token(token)
    user_id = decoded.get("sub")
    user_role = _parse_role(decoded.get("role"))

    _cache_user_context(user_id, user_role)
    return user_id, user_role


def get_current_user_from_socket(auth=None) -> str | None:
    user_id, _ = get_current_user_context_from_socket(auth)
    return user_id
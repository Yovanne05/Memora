from functools import wraps

from flask import g, request
from werkzeug.exceptions import BadRequest, Forbidden, Unauthorized

import config
from utils.collab_token import decode_collab_token


def require_collab_scope(required_scope: str | None = None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            token = _extract_collab_token()
            payload = decode_collab_token(token)

            note_id = _extract_note_id(kwargs)
            if payload["note_id"] != note_id:
                raise Forbidden("Invalid document scope.")

            if required_scope and required_scope not in payload["scope"]:
                raise Forbidden("Insufficient scope.")

            g.collab_payload = payload
            g.collab_note_id = note_id
            g.collab_token = token
            return func(*args, **kwargs)

        return wrapper

    return decorator


def require_collab_api_key():
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            api_key = request.headers.get("X-API-Key", "")
            if not api_key or api_key != config.COLLAB_API_KEY:
                raise Unauthorized("Invalid API key.")
            return func(*args, **kwargs)

        return wrapper

    return decorator


def _extract_collab_token() -> str:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.removeprefix("Bearer ").strip()

    raw = request.get_json(silent=True) or {}
    token = raw.get("collabToken") or raw.get("collab_token")
    if not token:
        raise Unauthorized("Missing collab token.")
    return token


def _extract_note_id(route_kwargs: dict) -> str:
    note_id = route_kwargs.get("note_id")
    if note_id:
        return str(note_id)

    raw = request.get_json(silent=True) or {}
    note_id = raw.get("note_id")
    if not note_id:
        raise BadRequest("Missing note_id.")
    return str(note_id)

from datetime import datetime, timedelta, timezone

import jwt
from werkzeug.exceptions import Unauthorized

import config


COLLAB_TOKEN_TYPE = "collab"


def create_collab_token(
    note_id: str,
    user_id: str,
    scope: list[str],
    expires_in_seconds: int,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "note_id": note_id,
        "user_id": user_id,
        "scope": scope,
        "typ": COLLAB_TOKEN_TYPE,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in_seconds)).timestamp()),
    }
    return jwt.encode(payload, config.COLLAB_JWT_SECRET_KEY, algorithm="HS256")


def decode_collab_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            config.COLLAB_JWT_SECRET_KEY,
            algorithms=["HS256"],
            options={
                "require": ["exp", "iat", "note_id", "user_id", "scope", "typ"]
            },
        )
    except jwt.ExpiredSignatureError as exc:
        raise Unauthorized("Collab token expired.") from exc
    except jwt.InvalidTokenError as exc:
        raise Unauthorized("Invalid collab token.") from exc

    if payload.get("typ") != COLLAB_TOKEN_TYPE:
        raise Unauthorized("Invalid collab token.")
    if not isinstance(payload.get("scope"), list):
        raise Unauthorized("Invalid collab token.")

    return payload

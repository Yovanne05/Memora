from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import config


def _build_storage_uri() -> str:
    if config.RATE_LIMIT_STORAGE_URI:
        return config.RATE_LIMIT_STORAGE_URI
    return f"redis://{config.REDIS_HOST}:{config.REDIS_PORT}/{config.REDIS_DB}"


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=config.RATE_LIMIT_DEFAULTS,
    storage_uri=_build_storage_uri(),
)


def init_http_rate_limiter(app):
    limiter.init_app(app)
    return limiter

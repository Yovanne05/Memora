from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[],
)


def init_limiter(app):
    limiter.init_app(app)
    limiter.enabled = True
    return limiter

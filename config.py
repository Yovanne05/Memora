import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "dev")
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
SQLALCHEMY_TEST_DATABASE_URI = os.getenv("SQLALCHEMY_TEST_DATABASE_URI")
SWAGGER_ENABLED = os.getenv("SWAGGER_ENABLED", "0") == "1"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
JWT_ACCESS_TOKEN_EXPIRES = timedelta(
    seconds=min(
        int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", str(24 * 3600))),
        24 * 3600,
    )
)
RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
LOGIN_RATE_LIMIT = os.getenv("LOGIN_RATE_LIMIT", "5 per 15 minutes")
RATELIMIT_ENABLED = os.getenv("RATELIMIT_ENABLED", "1") == "1"


def get_database_uri() -> str:
    env = APP_ENV
    if env == "test":
        uri = SQLALCHEMY_TEST_DATABASE_URI
    else:
        uri = SQLALCHEMY_DATABASE_URI
    return uri

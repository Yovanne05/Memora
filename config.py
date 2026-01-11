import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "dev")
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
if APP_ENV == "prod":
    SWAGGER_ENABLED = False
else:
    SWAGGER_ENABLED = os.getenv("SWAGGER_ENABLED", "0") == "1"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    if APP_ENV == "prod":
        raise ValueError("JWT_SECRET_KEY must be set in production")
    JWT_SECRET_KEY = "dev-secret-key"
JWT_ACCESS_TOKEN_EXPIRES = timedelta(
    seconds=min(
        int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", str(24 * 3600))),
        24 * 3600,
    )
)
IMAGE_MAX_CONTENT_LENGTH = int(
    os.getenv("IMAGE_MAX_CONTENT_LENGTH_BYTES", str(5 * 1024 * 1024))
)

COLLAB_JWT_SECRET_KEY = os.getenv("COLLAB_JWT_SECRET_KEY", JWT_SECRET_KEY)
COLLAB_JWT_EXPIRES_SECONDS = int(
    os.getenv("COLLAB_JWT_EXPIRES_SECONDS", "300")
)
COLLAB_API_KEY = os.getenv("COLLAB_API_KEY")
if COLLAB_API_KEY == "change-me":
    raise ValueError("COLLAB_API_KEY must be changed from default value")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
if not ALLOWED_ORIGINS and APP_ENV == "production":
    raise ValueError("ALLOWED_ORIGINS must be set in production")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
if not ALLOWED_ORIGINS and APP_ENV == "prod":
    raise ValueError("ALLOWED_ORIGINS must be set in production")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
RATE_LIMIT_STORAGE_URI = os.getenv("RATE_LIMIT_STORAGE_URI")
RATE_LIMIT_DEFAULTS = [
    limit.strip()
    for limit in os.getenv("RATE_LIMIT_DEFAULTS", "200 per day;50 per hour").split(";")
    if limit.strip()
]
RATE_LIMIT_LOGIN = os.getenv("RATE_LIMIT_LOGIN", "5 per minute")
RATE_LIMIT_REGISTER = os.getenv("RATE_LIMIT_REGISTER", "3 per hour")
COLLAB_SESSION_TTL_SECONDS = int(
    os.getenv("COLLAB_SESSION_TTL_SECONDS", str(24 * 3600))
)

STORAGE_DRIVER = os.getenv("STORAGE_DRIVER", "local").lower()
UPLOAD_LOCAL_ROOT = os.getenv("UPLOAD_LOCAL_ROOT", "uploads")
UPLOAD_PUBLIC_BASE_URL = os.getenv("UPLOAD_PUBLIC_BASE_URL")

STORAGE_S3_BUCKET = os.getenv("STORAGE_S3_BUCKET")
STORAGE_S3_ENDPOINT_URL = os.getenv("STORAGE_S3_ENDPOINT_URL")
STORAGE_S3_REGION = os.getenv("STORAGE_S3_REGION", "eu-west-1")
STORAGE_S3_ACCESS_KEY = os.getenv("STORAGE_S3_ACCESS_KEY")
STORAGE_S3_SECRET_KEY = os.getenv("STORAGE_S3_SECRET_KEY")
STORAGE_S3_PUBLIC_BASE_URL = os.getenv("STORAGE_S3_PUBLIC_BASE_URL")

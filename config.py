import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
if not SQLALCHEMY_DATABASE_URI:
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"

SWAGGER_ENABLED = os.getenv("SWAGGER_ENABLED", "0") == "1"
IS_TEST = os.getenv("TESTING", "0") == "1"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
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

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
SOCKETIO_PATH = os.getenv("SOCKETIO_PATH", "socket.io").lstrip("/")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
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

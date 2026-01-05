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
IMAGE_MAX_CONTENT_LENGTH = int(
    os.getenv("IMAGE_MAX_CONTENT_LENGTH_BYTES", str(5 * 1024 * 1024))
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
STORAGE_S3_URL_EXPIRATION_SECONDS = int(
    os.getenv("STORAGE_S3_URL_EXPIRATION_SECONDS", str(3600))
)


def get_database_uri() -> str:
    env = APP_ENV
    if env == "test":
        uri = SQLALCHEMY_TEST_DATABASE_URI
    else:
        uri = SQLALCHEMY_DATABASE_URI
    return uri

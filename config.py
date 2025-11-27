import os
from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV")
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
SQLALCHEMY_TEST_DATABASE_URI = os.getenv("SQLALCHEMY_TEST_DATABASE_URI")
SWAGGER_ENABLED = os.getenv("SWAGGER_ENABLED", "0") == "1"


def get_database_uri() -> str:
    env = APP_ENV
    if env == "test":
        uri = SQLALCHEMY_TEST_DATABASE_URI
    else:
        uri = SQLALCHEMY_DATABASE_URI
    return uri

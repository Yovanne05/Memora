from uuid import uuid4

import config
import pytest
from sqlalchemy import create_engine
from flask import g
from utils import db as db_utils
from utils.enums import VisibilityEnum


def _clear_scope_cache():
    """Nettoie le cache des scopes d'accès"""
    g.pop("accessible_collection_ids", None)
    g.pop("accessible_note_ids", None)


@pytest.fixture(autouse=True)
def configure_test_env(monkeypatch):
    """Configure l'environnement de test avec SQLite en mémoire pour tous les tests"""
    old_engine = db_utils.engine
    test_uri = "sqlite+pysqlite:///:memory:"
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("SWAGGER_ENABLED", "0")
    monkeypatch.setenv("SQLALCHEMY_TEST_DATABASE_URI", test_uri)
    monkeypatch.setattr(config, "APP_ENV", "test")
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)
    monkeypatch.setattr(config, "SQLALCHEMY_TEST_DATABASE_URI", test_uri)
    db_utils.SessionLocal.remove()

    test_engine = create_engine(
        test_uri,
        echo=False,
        future=True,
        pool_pre_ping=True,
    )
    monkeypatch.setattr(db_utils, "engine", test_engine)
    db_utils.SessionLocal.configure(bind=test_engine)

    with test_engine.begin():
        db_utils.Base.metadata.drop_all(bind=test_engine)
        db_utils.Base.metadata.create_all(bind=test_engine)

    try:
        yield
    finally:
        db_utils.SessionLocal.remove()
        db_utils.SessionLocal.configure(bind=old_engine)
        test_engine.dispose()


@pytest.fixture(autouse=True)
def app_context(configure_test_env):
    """Fournit un contexte d'application Flask pour tous les tests"""
    from app import create_app
    app = create_app()
    with app.app_context():
        db_utils.drop_all()
        db_utils.create_all()
        _clear_scope_cache()
        yield
        _clear_scope_cache()


@pytest.fixture
def app_client():
    from app import create_app
    app = create_app()
    with app.test_client() as client:
        client.environ_base["REMOTE_ADDR"] = (
            f"10.0.0.{int(uuid4().int % 200) + 1}"
        )
        yield client


class SharedNoteData:
    def __init__(self, client):
        self.client = client
        self.owner_id = None
        self.collection_id = None
        self.note_id = None
        self._credentials = None
        self.base_slug = uuid4().hex[:8]

    def bootstrap(self) -> None:
        email = f"user-{self.base_slug}@example.com"
        password = f"TestPwd-{self.base_slug}-1!" # NOSONAR
        payload = {
            "email": email,
            "password": password, # NOSONAR
            "username": f"user-{self.base_slug}",
            "display_name": f"User {self.base_slug}",
        }
        response = self.client.post("/users", json=payload)
        assert response.status_code == 201, response.get_data(as_text=True)
        body = response.get_json()
        self.owner_id = body["id"]
        self._credentials = {"email": email, "password": password}

        self._authenticate_client(self.owner_id)
        self.collection_id = self.create_collection()
        self.note_id = self.create_note(
            title=f"Note {self.base_slug}",
            content="Shared note content.",
        )

    def _authenticate_client(self, user_id: str) -> None:
        response = self.client.post(
            "/sessions",
            json={
                "identifier": self._credentials["email"],
                "password": self._credentials["password"], # NOSONAR
            },
        )
        assert response.status_code == 200, response.get_data(as_text=True)
        token = response.get_json()["access_token"]
        self.client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"

    def create_collection(self, owner_id: str | None = None, name: str | None = None) -> str:
        payload = {
            "name": name or f"Collection {self.base_slug}-{uuid4().hex[:4]}",
            "description": "Collection created for shared endpoints tests.",
            "owner_id": owner_id if owner_id is not None else self.owner_id,
            "visibility": VisibilityEnum.PRIVATE.value,
        }
        response = self.client.post("/collections", json=payload)
        assert response.status_code == 201, response.get_data(as_text=True)
        return response.get_json()["id"]

    def create_note(
        self,
        title: str,
        content: str,
        collection_id: str | None = None,
        owner_id: str | None = None,
        visibility: VisibilityEnum = VisibilityEnum.PRIVATE,
    ) -> str:
        payload = {
            "title": title,
            "content": content,
            "owner_id": owner_id if owner_id is not None else self.owner_id,
            "collection_id": (
                collection_id if collection_id is not None else self.collection_id
            ),
            "visibility": visibility.value,
        }
        response = self.client.post("/notes", json=payload)
        assert response.status_code == 201, response.get_data(as_text=True)
        return response.get_json()["id"]

    def cleanup(self) -> None:
        pass


@pytest.fixture
def note_test_data(app_client):
    data = SharedNoteData(client=app_client)
    data.bootstrap()
    try:
        yield data
    finally:
        data.cleanup()


@pytest.fixture
def client_with_note_data(note_test_data):
    yield note_test_data.client, note_test_data

"""
Fixtures pour les tests de statistiques utilisateur
"""
from uuid import uuid4

import config
import pytest
from sqlalchemy import create_engine
from flask import g
from utils import db as db_utils

TEST_PASSWORD = "StrongPwd1!"  # NOSONAR


def _clear_scope_cache():
    g.pop("accessible_collection_ids", None)
    g.pop("accessible_note_ids", None)


@pytest.fixture(autouse=True)
def configure_test_env(monkeypatch):
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
    from app import create_app
    app = create_app()
    with app.app_context():
        db_utils.drop_all()
        db_utils.create_all()
        _clear_scope_cache()
        yield
        _clear_scope_cache()


@pytest.fixture
def client(app_context):
    from app import create_app
    app = create_app()
    with app.test_client() as test_client:
        yield test_client


def _register_user(client):
    email = f"user-{uuid4().hex[:8]}@example.com"
    password = TEST_PASSWORD
    payload = {
        "email": email,
        "password": password,  # NOSONAR
        "username": f"user-{uuid4().hex[:6]}",
        "display_name": "Test User",
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    body = response.get_json()
    return email, password, body["user"]["id"], body["access_token"]


def _create_collection(client, token, owner_id):
    payload = {
        "name": f"Collection {uuid4().hex[:6]}",
        "description": "Test collection",
        "visibility": "private",
        "owner_id": owner_id,
    }
    response = client.post(
        "/collections", json=payload, headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    return response.get_json()["id"]


def _create_note(client, token, owner_id, collection_id=None):
    payload = {
        "title": f"Note {uuid4().hex[:6]}",
        "content": "Test content",
        "visibility": "private",
        "owner_id": owner_id,
    }
    if collection_id:
        payload["collection_id"] = collection_id
    response = client.post(
        "/notes", json=payload, headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    return response.get_json()["id"]


def _create_flashcard(client, token, note_id):
    payload = {
        "question": f"Question {uuid4().hex[:6]}",
        "answers": [
            {"answer_text": "Correct answer", "is_correct": True},
            {"answer_text": "Wrong answer", "is_correct": False},
        ],
    }
    response = client.post(
        f"/flashcards/{note_id}",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    return response.get_json()["id"]


def _share_note(client, token, note_id, target_user_id):
    payload = {"user_id": target_user_id, "permission": "read"}
    response = client.post(
        f"/note-shares/{note_id}",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201


def _share_collection(client, token, collection_id, target_user_id):
    payload = {"user_id": target_user_id, "permission": "read"}
    response = client.post(
        f"/collection-shares/{collection_id}",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201


@pytest.fixture
def register_user(client):
    return lambda: _register_user(client)


@pytest.fixture
def create_collection(client):
    return lambda token, owner_id: _create_collection(client, token, owner_id)


@pytest.fixture
def create_note(client):
    return lambda token, owner_id, collection_id=None: _create_note(
        client, token, owner_id, collection_id
    )


@pytest.fixture
def create_flashcard(client):
    return lambda token, note_id: _create_flashcard(client, token, note_id)


@pytest.fixture
def share_note(client):
    return lambda token, note_id, target_user_id: _share_note(
        client, token, note_id, target_user_id
    )


@pytest.fixture
def share_collection(client):
    return lambda token, collection_id, target_user_id: _share_collection(
        client, token, collection_id, target_user_id
    )

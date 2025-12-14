from uuid import uuid4

import config
import pytest


@pytest.fixture(autouse=True)
def configure_env(monkeypatch):
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)


@pytest.fixture
def client():
    from app import create_app
    app = create_app()
    app.testing = False
    app.config["TESTING"] = False
    from utils.limiter import limiter
    limiter.enabled = True
    limiter.reset()
    with app.test_client() as client:
        client.environ_base["REMOTE_ADDR"] = (
            f"10.0.0.{int(uuid4().int % 200) + 1}"
        )
        yield client


def _register_user(client):
    email = f"user-{uuid4().hex[:8]}@example.com"
    password = "StrongPwd1!"
    payload = {
        "email": email,
        "password": password,
        "username": f"user-{uuid4().hex[:6]}",
        "display_name": "Test User",
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201, response.get_data(as_text=True)
    body = response.get_json()
    return email, password, body


def test_register_returns_token_and_user(client):
    email, _, body = _register_user(client)

    assert "access_token" in body
    assert body["user"]["email"] == email
    assert body["user"]["is_active"] is True


def test_register_rejects_weak_password(client):
    payload = {
        "email": f"weak-{uuid4().hex[:8]}@example.com",
        "password": "weakpass",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 422


def test_login_returns_token(client):
    email, password, _ = _register_user(client)
    login_payload = {"identifier": email, "password": password}

    response = client.post("/auth/login", json=login_payload)

    assert response.status_code == 200
    body = response.get_json()
    assert body["user"]["email"] == email
    assert "access_token" in body


def test_login_returns_401_on_invalid_password(client):
    email, _, _ = _register_user(client)
    login_payload = {"identifier": email, "password": "WrongPwd1!"}

    response = client.post("/auth/login", json=login_payload)

    assert response.status_code == 401


def test_login_is_rate_limited(client):
    email, _, _ = _register_user(client)
    payload = {"identifier": email, "password": "WrongPwd1!"}

    for _ in range(5):
        client.post("/auth/login", json=payload)

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 429


def test_me_requires_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_notes_and_collections_require_auth(client):
    notes_response = client.get("/notes")
    collections_response = client.get("/collections")

    assert notes_response.status_code == 401
    assert collections_response.status_code == 401

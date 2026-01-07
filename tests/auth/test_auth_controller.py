from uuid import uuid4

import config
import pytest

# Test constants
TEST_PASSWORD = "StrongPass1!" # NOSONAR
WEAK_PASSWORD = "weakpass" # NOSONAR
WRONG_PASSWORD = "WrongPass12!" # NOSONAR


@pytest.fixture(autouse=True)
def configure_env(monkeypatch):
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)


@pytest.fixture
def client():
    from app import create_app
    app = create_app()
    app.testing = False
    app.config["TESTING"] = False
    with app.test_client() as client:
        client.environ_base["REMOTE_ADDR"] = (
            f"10.0.0.{int(uuid4().int % 200) + 1}"
        )
        yield client


def _register_user(client):
    email = f"user-{uuid4().hex[:8]}@example.com"
    password = TEST_PASSWORD
    payload = {
        "email": email,
        "password": password, # NOSONAR
        "username": f"user-{uuid4().hex[:6]}",
        "display_name": "Test User",
    }
    response = client.post("/users", json=payload)
    assert response.status_code == 201, response.get_data(as_text=True)
    body = response.get_json()
    return email, password, body


def test_register_returns_user(client):
    email, _, body = _register_user(client)

    assert body["email"] == email


def test_register_rejects_weak_password(client):
    payload = {
        "email": f"weak-{uuid4().hex[:8]}@example.com",
        "password": WEAK_PASSWORD, # NOSONAR
    }

    response = client.post("/users", json=payload)

    assert response.status_code == 422


def test_login_returns_token(client):
    email, password, _ = _register_user(client)
    login_payload = {"identifier": email, "password": password} # NOSONAR

    response = client.post("/sessions", json=login_payload)

    assert response.status_code == 200
    body = response.get_json()
    assert body["user"]["email"] == email
    assert "access_token" in body


def test_login_returns_401_on_invalid_password(client):
    email, _, _ = _register_user(client)
    login_payload = {"identifier": email, "password": WRONG_PASSWORD} # NOSONAR

    response = client.post("/sessions", json=login_payload)

    assert response.status_code == 401


def test_login_is_rate_limited(client):
    email, _, _ = _register_user(client)
    payload = {"identifier": email, "password": WRONG_PASSWORD} # NOSONAR

    for _ in range(5):
        client.post("/sessions", json=payload)

    response = client.post("/sessions", json=payload)

    assert response.status_code == 429

from uuid import uuid4

import pytest

TEST_PASSWORD = "StrongPass1!"  # NOSONAR


@pytest.fixture
def client():
    """Client de test Flask"""
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
    response = client.post("/users", json=payload)
    assert response.status_code == 201
    user_id = response.get_json()["id"]
    login_payload = {"identifier": email, "password": password}  # NOSONAR
    login_response = client.post("/sessions", json=login_payload)
    assert login_response.status_code == 200
    token = login_response.get_json()["access_token"]
    return email, password, user_id, token


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
        f"/notes/{note_id}/flashcards",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    return response.get_json()["id"]


def _share_note(client, token, note_id, target_user_id):
    payload = {"user_id": target_user_id, "permission": "read"}
    response = client.post(
        f"/notes/{note_id}/shares",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201


def _share_collection(client, token, collection_id, target_user_id):
    payload = {"user_id": target_user_id, "permission": "read"}
    response = client.post(
        f"/collections/{collection_id}/shares",
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

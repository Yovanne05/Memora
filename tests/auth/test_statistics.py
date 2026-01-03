from uuid import uuid4

import config
import pytest

TEST_PASSWORD = "StrongPwd1!"  # NOSONAR


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
        yield client


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


def test_get_statistics_returns_empty_stats_for_new_user(client):
    _, _, _, token = _register_user(client)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesCreated"] == 0
    assert body["contentStatistics"]["collectionsCreated"] == 0
    assert body["contentStatistics"]["flashcardsCreated"] == 0
    assert body["contentStatistics"]["notesSharedByUser"] == 0
    assert body["contentStatistics"]["collectionsSharedByUser"] == 0
    assert body["reviewStatistics"] is None


def test_get_statistics_counts_created_notes(client):
    _, _, user_id, token = _register_user(client)
    _create_note(client, token, user_id)
    _create_note(client, token, user_id)
    _create_note(client, token, user_id)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesCreated"] == 3


def test_get_statistics_counts_created_collections(client):
    _, _, user_id, token = _register_user(client)
    _create_collection(client, token, user_id)
    _create_collection(client, token, user_id)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["collectionsCreated"] == 2


def test_get_statistics_counts_created_flashcards(client):
    _, _, user_id, token = _register_user(client)
    note_id = _create_note(client, token, user_id)
    _create_flashcard(client, token, note_id)
    _create_flashcard(client, token, note_id)
    _create_flashcard(client, token, note_id)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["flashcardsCreated"] == 3


def test_get_statistics_counts_shared_notes(client):
    _, _, user1_id, token1 = _register_user(client)
    _, _, user2_id, _ = _register_user(client)
    note1_id = _create_note(client, token1, user1_id)
    note2_id = _create_note(client, token1, user1_id)
    _share_note(client, token1, note1_id, user2_id)
    _share_note(client, token1, note2_id, user2_id)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token1}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesSharedByUser"] == 2


def test_get_statistics_counts_shared_collections(client):
    _, _, user1_id, token1 = _register_user(client)
    _, _, user2_id, _ = _register_user(client)
    collection_id = _create_collection(client, token1, user1_id)
    _share_collection(client, token1, collection_id, user2_id)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token1}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["collectionsSharedByUser"] == 1


def test_get_statistics_with_complete_scenario(client):
    _, _, user1_id, token1 = _register_user(client)
    _, _, user2_id, _ = _register_user(client)

    collection1_id = _create_collection(client, token1, user1_id)
    collection2_id = _create_collection(client, token1, user1_id)

    note1_id = _create_note(client, token1, user1_id, collection1_id)
    note2_id = _create_note(client, token1, user1_id, collection2_id)
    note3_id = _create_note(client, token1, user1_id)

    _create_flashcard(client, token1, note1_id)
    _create_flashcard(client, token1, note1_id)
    _create_flashcard(client, token1, note2_id)

    _share_note(client, token1, note1_id, user2_id)
    _share_collection(client, token1, collection1_id, user2_id)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token1}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesCreated"] == 3
    assert body["contentStatistics"]["collectionsCreated"] == 2
    assert body["contentStatistics"]["flashcardsCreated"] == 3
    assert body["contentStatistics"]["notesSharedByUser"] == 1
    assert body["contentStatistics"]["collectionsSharedByUser"] == 1


def test_get_statistics_requires_authentication(client):
    response = client.get("/auth/me/statistics")

    assert response.status_code == 401

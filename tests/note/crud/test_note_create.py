"""Tests for POST /notes endpoint"""
from uuid import uuid4

from utils.enums import VisibilityEnum


def test_create_note_returns_created_note(client_with_note_data):
    client, data = client_with_note_data
    title = f"New title {uuid4()}"
    payload = {
        "title": title,
        "content": "New content",
        "owner_id": data.owner_id,
        "collection_id": data.collection_id,
        "visibility": VisibilityEnum.PUBLIC.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["title"] == title
    assert len(body["owners"]) == 1
    assert body["owners"][0]["user_id"] == data.owner_id
    data.track_created_note(body["id"])


def test_create_note_requires_existing_owner(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "title": f"Missing owner note {uuid4().hex[:8]}",
        "content": "Content for missing owner",
        "owner_id": str(uuid4()),
        "collection_id": data.collection_id,
        "visibility": VisibilityEnum.PRIVATE.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 422


def test_create_note_conflict_on_duplicate_title(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "title": data.base_title,
        "content": "Duplicate content",
        "owner_id": data.owner_id,
        "collection_id": data.collection_id,
        "visibility": VisibilityEnum.PRIVATE.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 409


def test_create_note_rejects_foreign_collection(client_with_note_data):
    client, data = client_with_note_data
    foreign_owner_id = data.create_user("foreign-owner")
    foreign_collection_id = data.create_collection(
        owner_id=foreign_owner_id, name=f"Foreign collection {uuid4().hex[:6]}"
    )
    payload = {
        "title": f"Foreign collection note {uuid4().hex[:8]}",
        "content": "Should not be allowed",
        "owner_id": data.owner_id,
        "collection_id": foreign_collection_id,
        "visibility": VisibilityEnum.PRIVATE.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 422

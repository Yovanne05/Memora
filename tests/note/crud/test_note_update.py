"""Tests for PATCH /notes/{note_id} endpoint"""
from uuid import uuid4

from utils.enums import VisibilityEnum


def test_update_note_returns_updated_note(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "title": "Updated title",
        "content": "Updated content",
        "visibility": VisibilityEnum.PUBLIC.value,
    }

    response = client.patch(f"/notes/{data.note_id}", json=payload)

    assert response.status_code == 200
    body = response.get_json()
    assert body["title"] == "Updated title"
    assert body["content"] == "Updated content"


def test_update_note_conflict_when_title_exists(client_with_note_data):
    client, data = client_with_note_data
    other_title = f"Existing title {uuid4().hex[:8]}"
    data.create_note(
        title=other_title,
        content="Existing content",
        collection_id=data.collection_id,
    )
    payload = {
        "title": other_title,
        "content": "New content",
    }

    response = client.patch(f"/notes/{data.note_id}", json=payload)

    assert response.status_code == 409


def test_update_note_rejects_collection_change_when_linked(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_link()
    new_collection_id = data.create_collection(
        name=f"New collection {uuid4().hex[:6]}"
    )
    payload = {"collection_id": new_collection_id}

    response = client.patch(f"/notes/{data.note_id}", json=payload)

    assert response.status_code == 422


def test_update_note_returns_404_when_missing(client_with_note_data):
    client, _ = client_with_note_data
    payload = {"title": "Will not be found"}

    response = client.patch(f"/notes/{uuid4()}", json=payload)

    assert response.status_code == 500

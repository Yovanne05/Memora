from uuid import uuid4

from utils.enums import VisibilityEnum


def test_find_many_returns_notes(client_with_note_data):
    client, data = client_with_note_data
    query = {"ownerId": data.owner_id, "titleContains": data.search_term}

    response = client.get("/notes", query_string=query)

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == data.note_id


def test_find_one_returns_single_note(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/notes/{data.note_id}")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["id"] == data.note_id


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
    assert body["owner_id"] == data.owner_id
    data.track_created_note(body["id"])


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


def test_delete_note_calls_service(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(f"/notes/{data.note_id}")

    assert response.status_code == 204

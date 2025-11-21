from conftest import COLLECTION_ID, NOTE_ID, OWNER_ID
from utils.enums import VisibilityEnum


def test_find_many_returns_notes(client_with_note_stubs):
    client, crud_stub, _ = client_with_note_stubs
    # Given
    query = {"ownerId": OWNER_ID, "titleContains": "note"}
    # When
    response = client.get("/notes", query_string=query)
    # Then
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == NOTE_ID
    assert crud_stub.last_find_params.owner_id == OWNER_ID
    assert crud_stub.last_find_params.title_contains == "note"


def test_find_one_returns_single_note(client_with_note_stubs):
    client, crud_stub, _ = client_with_note_stubs
    # When
    response = client.get(f"/notes/{NOTE_ID}")
    # Then
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["id"] == NOTE_ID
    assert crud_stub.last_find_one_id == NOTE_ID


def test_create_note_returns_created_note(client_with_note_stubs):
    client, crud_stub, _ = client_with_note_stubs
    # Given
    payload = {
        "title": "New title",
        "content": "New content",
        "owner_id": OWNER_ID,
        "collection_id": COLLECTION_ID,
        "visibility": VisibilityEnum.PUBLIC.value,
    }
    # When
    response = client.post("/notes", json=payload)
    # Then
    assert response.status_code == 201
    body = response.get_json()
    assert body["title"] == "New title"
    assert body["owner_id"] == OWNER_ID
    assert crud_stub.last_create_payload.title == "New title"
    assert crud_stub.last_create_payload.collection_id == COLLECTION_ID


def test_update_note_returns_updated_note(client_with_note_stubs):
    client, crud_stub, _ = client_with_note_stubs
    # Given
    payload = {
        "title": "Updated title",
        "content": "Updated content",
        "visibility": VisibilityEnum.PUBLIC.value,
    }
    # When
    response = client.patch(f"/notes/{NOTE_ID}", json=payload)
    # Then
    assert response.status_code == 200
    body = response.get_json()
    assert body["title"] == "Updated title"
    assert body["content"] == "Updated content"
    updated_call = crud_stub.last_update_payload
    assert updated_call[0] == NOTE_ID
    assert updated_call[1].title == "Updated title"


def test_delete_note_calls_service(client_with_note_stubs):
    client, crud_stub, _ = client_with_note_stubs
    # When
    response = client.delete(f"/notes/{NOTE_ID}")
    # Then
    assert response.status_code == 204
    assert NOTE_ID in crud_stub.deleted_ids

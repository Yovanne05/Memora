from conftest import LINKED_NOTE_ID, NOTE_ID


def test_list_links_returns_items(client_with_note_stubs):
    client, _, _, link_stub = client_with_note_stubs
    # When
    response = client.get(f"/notes/{NOTE_ID}/links")
    # Then
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["linked_note_id"] == LINKED_NOTE_ID
    assert payload["items"][0]["note_id"] == NOTE_ID
    assert link_stub.last_list_note_id == NOTE_ID


def test_create_link_returns_created_link(client_with_note_stubs):
    client, _, _, link_stub = client_with_note_stubs
    # Given
    payload = {"linked_note_id": LINKED_NOTE_ID}
    # When
    response = client.post(f"/notes/{NOTE_ID}/links", json=payload)
    # Then
    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == NOTE_ID
    assert body["linked_note_id"] == LINKED_NOTE_ID
    create_call = link_stub.last_create_payload
    assert create_call[0] == NOTE_ID
    assert create_call[1].linked_note_id == LINKED_NOTE_ID


def test_delete_link_calls_service(client_with_note_stubs):
    client, _, _, link_stub = client_with_note_stubs
    # When
    response = client.delete(
        f"/notes/{NOTE_ID}/links/{LINKED_NOTE_ID}"
    )
    # Then
    assert response.status_code == 204
    assert link_stub.deleted == (NOTE_ID, LINKED_NOTE_ID)

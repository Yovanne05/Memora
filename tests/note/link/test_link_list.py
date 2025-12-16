"""Tests for GET /note-links endpoint"""
from uuid import uuid4


def test_list_links_returns_items(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_link()

    response = client.get(
        "/note-links", query_string={"noteId": data.note_id}
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert len(payload["items"]) == 1
    assert payload["items"][0]["linked_note_id"] == data.linked_note_id
    assert payload["items"][0]["note_id"] == data.note_id


def test_list_links_returns_empty_for_unknown_note(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get("/note-links", query_string={"noteId": uuid4()})

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 0
    assert payload["items"] == []

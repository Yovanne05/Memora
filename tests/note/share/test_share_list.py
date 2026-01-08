"""Tests for GET /notes/{note_id}/shares endpoint"""
from uuid import uuid4


def test_list_shares_returns_items(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()

    response = client.get(f"/notes/{data.note_id}/shares")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert len(payload["items"]) == 1
    assert payload["items"][0]["user"]["id"] == data.share_user_id


def test_list_shares_returns_empty_for_unknown_note(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get(f"/notes/{uuid4()}/shares")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 0
    assert payload["items"] == []

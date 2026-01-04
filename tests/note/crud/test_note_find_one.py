"""Tests for GET /notes/{note_id} endpoint"""
from uuid import uuid4


def test_find_one_returns_single_note(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/notes/{data.note_id}")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["id"] == data.note_id
    assert payload["is_favorite"] is False


def test_find_one_returns_404_when_note_missing(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get(f"/notes/{uuid4()}")

    assert response.status_code == 404

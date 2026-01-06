"""Tests for DELETE /notes/{note_id}/relations/{linked_note_id} endpoint"""
from uuid import uuid4


def test_delete_link_calls_service(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_link()

    response = client.delete(
        f"/notes/{data.note_id}/relations/{data.linked_note_id}"
    )

    assert response.status_code == 204


def test_delete_link_returns_404_when_missing(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(
        f"/notes/{data.note_id}/relations/{uuid4()}"
    )

    assert response.status_code == 404

"""Tests for DELETE /notes/{note_id}/shares/{user_id} endpoint"""
from uuid import uuid4


def test_revoke_share_calls_service(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()

    response = client.delete(
        f"/notes/{data.note_id}/shares/{data.share_user_id}"
    )

    assert response.status_code == 204


def test_revoke_share_returns_404_when_missing(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(
        f"/notes/{data.note_id}/shares/{uuid4()}"
    )

    assert response.status_code == 404

"""Tests for PATCH /notes/{note_id}/shares/{user_id} endpoint"""
from uuid import uuid4

from utils.enums import SharePermissionEnum


def test_update_share_returns_updated_share(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()
    payload = {"permission": SharePermissionEnum.WRITE.value}

    response = client.patch(
        f"/notes/{data.note_id}/shares/{data.share_user_id}",
        json=payload,
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["permission"] == SharePermissionEnum.WRITE.value


def test_update_share_returns_404_when_missing(client_with_note_data):
    client, data = client_with_note_data
    payload = {"permission": SharePermissionEnum.WRITE.value}

    response = client.patch(
        f"/notes/{data.note_id}/shares/{uuid4()}",
        json=payload,
    )

    assert response.status_code == 404

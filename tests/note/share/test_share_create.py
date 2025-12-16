"""Tests for POST /note-shares/{note_id} endpoint"""
from uuid import uuid4

from utils.enums import SharePermissionEnum


def test_share_note_returns_created_share(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "user_id": data.share_user_id,
        "permission": SharePermissionEnum.WRITE.value,
    }

    response = client.post(f"/note-shares/{data.note_id}", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == data.note_id
    assert body["user_id"] == data.share_user_id
    assert body["permission"] == SharePermissionEnum.WRITE.value
    data.track_created_share(data.note_id, data.share_user_id)


def test_share_note_rejects_owner_target(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "user_id": data.owner_id,
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(f"/note-shares/{data.note_id}", json=payload)
    assert response.status_code == 422


def test_share_note_requires_existing_user(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "user_id": str(uuid4()),
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(f"/note-shares/{data.note_id}", json=payload)

    assert response.status_code == 422


def test_share_note_prevents_duplicates(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()
    payload = {
        "user_id": data.share_user_id,
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(f"/note-shares/{data.note_id}", json=payload)

    assert response.status_code == 409

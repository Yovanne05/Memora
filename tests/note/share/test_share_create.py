"""Tests for POST /notes/{note_id}/shares endpoint"""
from uuid import uuid4

from utils.enums import SharePermissionEnum


def test_share_note_returns_created_share(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "user_id": data.share_user_id,
        "permission": SharePermissionEnum.WRITE.value,
    }

    response = client.post(f"/notes/{data.note_id}/shares", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == data.note_id
    assert body["user"]["id"] == data.share_user_id
    assert body["permission"] == SharePermissionEnum.WRITE.value
    data.track_created_share(data.note_id, data.share_user_id)


def test_share_note_rejects_owner_target(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "user_id": data.owner_id,
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(f"/notes/{data.note_id}/shares", json=payload)
    assert response.status_code == 422


def test_share_note_requires_existing_user(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "user_id": str(uuid4()),
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(f"/notes/{data.note_id}/shares", json=payload)

    assert response.status_code == 422


def test_share_note_prevents_duplicates(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()
    payload = {
        "user_id": data.share_user_id,
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(f"/notes/{data.note_id}/shares", json=payload)

    assert response.status_code == 409


def test_share_note_with_owner_permission(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "user_id": data.share_user_id,
        "permission": SharePermissionEnum.OWNER.value,
    }

    response = client.post(f"/notes/{data.note_id}/shares", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == data.note_id
    assert body["user"]["id"] == data.share_user_id
    assert body["permission"] == SharePermissionEnum.OWNER.value
    data.track_created_share(data.note_id, data.share_user_id)

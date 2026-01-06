"""Tests for POST /notes/{note_id}/share-links endpoint"""
from utils.enums import SharePermissionEnum


def test_create_note_share_link_returns_created_link(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(
        f"/notes/{data.note_id}/share-links", json=payload
    )

    assert response.status_code == 201
    body = response.get_json()
    assert "id" in body
    assert body["note_id"] == data.note_id
    assert body["permission"] == SharePermissionEnum.READ.value
    assert "created_at" in body


def test_create_note_share_link_with_write_permission(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "permission": SharePermissionEnum.WRITE.value,
    }

    response = client.post(
        f"/notes/{data.note_id}/share-links", json=payload
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == data.note_id
    assert body["permission"] == SharePermissionEnum.WRITE.value


def test_create_note_share_link_with_owner_permission(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "permission": SharePermissionEnum.OWNER.value,
    }

    response = client.post(
        f"/notes/{data.note_id}/share-links", json=payload
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == data.note_id
    assert body["permission"] == SharePermissionEnum.OWNER.value


def test_create_note_share_link_requires_authentication(app_client):
    from uuid import uuid4
    note_id = str(uuid4())
    payload = {
        "permission": SharePermissionEnum.READ.value,
    }

    response = app_client.post(
        f"/notes/{note_id}/share-links", json=payload
    )

    assert response.status_code == 401


def test_create_note_share_link_with_nonexistent_note(client_with_note_data):
    from uuid import uuid4
    client, data = client_with_note_data

    fake_note_id = str(uuid4())
    payload = {
        "permission": SharePermissionEnum.READ.value,
    }

    response = client.post(
        f"/notes/{fake_note_id}/share-links", json=payload
    )

    assert response.status_code == 404


def test_create_note_share_link_with_invalid_permission(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "permission": "invalid_permission",
    }

    response = client.post(
        f"/notes/{data.note_id}/share-links", json=payload
    )

    assert response.status_code == 422


def test_create_multiple_share_links_for_same_note(client_with_note_data):
    client, data = client_with_note_data

    # Create first link
    payload1 = {"permission": SharePermissionEnum.READ.value}
    response1 = client.post(
        f"/notes/{data.note_id}/share-links", json=payload1
    )
    assert response1.status_code == 201
    link1_id = response1.get_json()["id"]

    # Create second link
    payload2 = {"permission": SharePermissionEnum.WRITE.value}
    response2 = client.post(
        f"/notes/{data.note_id}/share-links", json=payload2
    )
    assert response2.status_code == 201
    link2_id = response2.get_json()["id"]

    # Both links should have different IDs
    assert link1_id != link2_id

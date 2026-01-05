"""Tests for DELETE /note-share-links/{note_id}/links/{link_id} endpoint"""
from uuid import uuid4

from utils.enums import SharePermissionEnum


def test_delete_note_share_link_returns_no_content(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(f"/note-share-links/{data.note_id}", json=payload)
    assert create_response.status_code == 201
    link_id = create_response.get_json()["id"]

    # Delete share link
    response = client.delete(f"/note-share-links/{data.note_id}/links/{link_id}")

    assert response.status_code == 204


def test_delete_note_share_link_removes_from_list(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(f"/note-share-links/{data.note_id}", json=payload)
    assert create_response.status_code == 201
    link_id = create_response.get_json()["id"]

    # Verify it exists
    list_response = client.get(f"/note-share-links?noteId={data.note_id}")
    assert list_response.status_code == 200
    assert len(list_response.get_json()["items"]) == 1

    # Delete share link
    delete_response = client.delete(f"/note-share-links/{data.note_id}/links/{link_id}")
    assert delete_response.status_code == 204

    # Verify it's gone
    list_response = client.get(f"/note-share-links?noteId={data.note_id}")
    assert list_response.status_code == 200
    assert len(list_response.get_json()["items"]) == 0


def test_delete_note_share_link_requires_authentication(app_client):
    note_id = str(uuid4())
    link_id = str(uuid4())

    response = app_client.delete(f"/note-share-links/{note_id}/links/{link_id}")

    assert response.status_code == 401


def test_delete_note_share_link_with_nonexistent_link(client_with_note_data):
    client, data = client_with_note_data

    fake_link_id = str(uuid4())
    response = client.delete(f"/note-share-links/{data.note_id}/links/{fake_link_id}")

    assert response.status_code == 404


def test_delete_note_share_link_with_nonexistent_note(client_with_note_data):
    client, data = client_with_note_data

    fake_note_id = str(uuid4())
    fake_link_id = str(uuid4())
    response = client.delete(f"/note-share-links/{fake_note_id}/links/{fake_link_id}")

    assert response.status_code == 404


def test_delete_note_share_link_invalidates_public_access(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(f"/note-share-links/{data.note_id}", json=payload)
    assert create_response.status_code == 201
    link_id = create_response.get_json()["id"]

    # Verify public access works
    public_response = client.get(f"/shared/notes/{link_id}")
    assert public_response.status_code == 200

    # Delete share link
    delete_response = client.delete(f"/note-share-links/{data.note_id}/links/{link_id}")
    assert delete_response.status_code == 204

    # Verify public access no longer works
    public_response = client.get(f"/shared/notes/{link_id}")
    assert public_response.status_code == 404

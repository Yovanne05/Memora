"""Tests for GET /note-public-links/{token} endpoint"""
from uuid import uuid4

from utils.enums import SharePermissionEnum


def test_get_shared_note_returns_note_data(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(
        f"/notes/{data.note_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Access note via public link (no authentication required)
    # Remove auth header
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    response = client.get(f"/note-public-links/{token}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["id"] == data.note_id
    assert "title" in body
    assert "content" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_get_shared_note_does_not_require_authentication(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.WRITE.value}
    create_response = client.post(
        f"/notes/{data.note_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Remove authentication
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    response = client.get(f"/note-public-links/{token}")

    # Should work without auth
    assert response.status_code == 200


def test_get_shared_note_with_invalid_token(app_client):
    fake_token = str(uuid4())

    response = app_client.get(f"/note-public-links/{fake_token}")

    assert response.status_code == 404


def test_get_shared_note_with_malformed_token(app_client):
    malformed_token = "not-a-uuid"

    response = app_client.get(f"/note-public-links/{malformed_token}")

    assert response.status_code == 404


def test_get_shared_note_works_with_any_permission_level(client_with_note_data):
    client, data = client_with_note_data

    # Test with each permission level
    permissions = [
        SharePermissionEnum.READ,
        SharePermissionEnum.WRITE,
        SharePermissionEnum.OWNER,
    ]

    for permission in permissions:
        # Create a new note for each test
        note_id = data.create_note(
            title=f"Note for {permission.value}",
            content="Test content",
        )

        # Create share link
        payload = {"permission": permission.value}
        create_response = client.post(
            f"/notes/{note_id}/public-links", json=payload
        )
        assert create_response.status_code == 201
        token = create_response.get_json()["id"]

        # Remove auth
        if "HTTP_AUTHORIZATION" in client.environ_base:
            del client.environ_base["HTTP_AUTHORIZATION"]

        # Access via public link
        response = client.get(f"/note-public-links/{token}")

        assert response.status_code == 200
        body = response.get_json()
        assert body["id"] == note_id

        # Re-authenticate for next iteration
        data._authenticate_client(data.owner_id)


def test_get_shared_note_returns_same_data_as_authenticated_request(
    client_with_note_data,
):
    client, data = client_with_note_data

    # Get note data with authentication
    auth_response = client.get(f"/notes/{data.note_id}")
    assert auth_response.status_code == 200
    auth_data = auth_response.get_json()

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(
        f"/notes/{data.note_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Remove auth
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    # Get note via public link
    public_response = client.get(f"/note-public-links/{token}")
    assert public_response.status_code == 200
    public_data = public_response.get_json()

    # Compare key fields
    assert auth_data["id"] == public_data["id"]
    assert auth_data["title"] == public_data["title"]
    assert auth_data["content"] == public_data["content"]
    assert auth_data["owners"] == public_data["owners"]


def test_get_shared_note_after_link_deletion_fails(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(
        f"/notes/{data.note_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Verify it works
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]
    response = client.get(f"/note-public-links/{token}")
    assert response.status_code == 200

    # Re-authenticate and delete link
    data._authenticate_client(data.owner_id)
    delete_response = client.delete(
        f"/notes/{data.note_id}/public-links/{token}"
    )
    assert delete_response.status_code == 204

    # Try to access again
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]
    response = client.get(f"/note-public-links/{token}")
    assert response.status_code == 404


def test_get_shared_note_works_for_different_notes(client_with_note_data):
    client, data = client_with_note_data

    # Create multiple notes with share links
    note_ids = []
    tokens = []

    for i in range(3):
        note_id = data.create_note(
            title=f"Shared note {i}",
            content=f"Content {i}",
        )
        note_ids.append(note_id)

        payload = {"permission": SharePermissionEnum.READ.value}
        create_response = client.post(
            f"/notes/{note_id}/public-links", json=payload
        )
        assert create_response.status_code == 201
        tokens.append(create_response.get_json()["id"])

    # Remove auth
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    # Verify each token returns the correct note
    for i, token in enumerate(tokens):
        response = client.get(f"/note-public-links/{token}")
        assert response.status_code == 200
        body = response.get_json()
        assert body["id"] == note_ids[i]
        assert body["title"] == f"Shared note {i}"

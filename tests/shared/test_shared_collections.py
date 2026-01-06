"""Tests for GET /collection-public-links/{token} endpoint"""
from uuid import uuid4

from utils.enums import SharePermissionEnum


def test_get_shared_collection_returns_collection_data(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Access collection via public link (no authentication required)
    # Remove auth header
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    response = client.get(f"/collection-public-links/{token}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["id"] == data.collection_id
    assert "name" in body
    assert "description" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_get_shared_collection_does_not_require_authentication(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.WRITE.value}
    create_response = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Remove authentication
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    response = client.get(f"/collection-public-links/{token}")

    # Should work without auth
    assert response.status_code == 200


def test_get_shared_collection_with_invalid_token(app_client):
    fake_token = str(uuid4())

    response = app_client.get(f"/collection-public-links/{fake_token}")

    assert response.status_code == 404


def test_get_shared_collection_with_malformed_token(app_client):
    malformed_token = "not-a-uuid"

    response = app_client.get(f"/collection-public-links/{malformed_token}")

    assert response.status_code == 404


def test_get_shared_collection_includes_all_collection_fields(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.OWNER.value}
    create_response = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Remove auth
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    response = client.get(f"/collection-public-links/{token}")

    assert response.status_code == 200
    body = response.get_json()

    # Verify all expected fields are present
    expected_fields = [
        "id",
        "name",
        "description",
        "owner_id",
        "visibility",
        "created_at",
        "updated_at",
    ]
    for field in expected_fields:
        assert field in body, f"Missing field: {field}"


def test_get_shared_collection_works_with_any_permission_level(client_with_note_data):
    client, data = client_with_note_data

    # Test with each permission level
    permissions = [
        SharePermissionEnum.READ,
        SharePermissionEnum.WRITE,
        SharePermissionEnum.OWNER,
    ]

    for permission in permissions:
        # Create a new collection for each test
        collection_id = data.create_collection(
            name=f"Collection for {permission.value}"
        )

        # Create share link
        payload = {"permission": permission.value}
        create_response = client.post(
            f"/collections/{collection_id}/public-links", json=payload
        )
        assert create_response.status_code == 201
        token = create_response.get_json()["id"]

        # Remove auth
        if "HTTP_AUTHORIZATION" in client.environ_base:
            del client.environ_base["HTTP_AUTHORIZATION"]

        # Access via public link
        response = client.get(f"/collection-public-links/{token}")

        assert response.status_code == 200
        body = response.get_json()
        assert body["id"] == collection_id

        # Re-authenticate for next iteration
        data._authenticate_client(data.owner_id)


def test_get_shared_collection_returns_same_data_as_authenticated_request(
    client_with_note_data,
):
    client, data = client_with_note_data

    # Get collection data with authentication
    auth_response = client.get(f"/collections/{data.collection_id}")
    assert auth_response.status_code == 200
    auth_data = auth_response.get_json()

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Remove auth
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    # Get collection via public link
    public_response = client.get(f"/collection-public-links/{token}")
    assert public_response.status_code == 200
    public_data = public_response.get_json()

    # Compare key fields
    assert auth_data["id"] == public_data["id"]
    assert auth_data["name"] == public_data["name"]
    assert auth_data["description"] == public_data["description"]
    assert auth_data["owner_id"] == public_data["owner_id"]


def test_get_shared_collection_after_link_deletion_fails(client_with_note_data):
    client, data = client_with_note_data

    # Create share link
    payload = {"permission": SharePermissionEnum.READ.value}
    create_response = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload
    )
    assert create_response.status_code == 201
    token = create_response.get_json()["id"]

    # Verify it works
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]
    response = client.get(f"/collection-public-links/{token}")
    assert response.status_code == 200

    # Re-authenticate and delete link
    data._authenticate_client(data.owner_id)
    delete_response = client.delete(
        f"/collections/{data.collection_id}/public-links/{token}"
    )
    assert delete_response.status_code == 204

    # Try to access again
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]
    response = client.get(f"/collection-public-links/{token}")
    assert response.status_code == 404


def test_get_shared_collection_works_for_different_collections(client_with_note_data):
    client, data = client_with_note_data

    # Create multiple collections with share links
    collection_ids = []
    tokens = []

    for i in range(3):
        collection_id = data.create_collection(name=f"Shared collection {i}")
        collection_ids.append(collection_id)

        payload = {"permission": SharePermissionEnum.READ.value}
        create_response = client.post(
            f"/collections/{collection_id}/public-links", json=payload
        )
        assert create_response.status_code == 201
        tokens.append(create_response.get_json()["id"])

    # Remove auth
    if "HTTP_AUTHORIZATION" in client.environ_base:
        del client.environ_base["HTTP_AUTHORIZATION"]

    # Verify each token returns the correct collection
    for i, token in enumerate(tokens):
        response = client.get(f"/collection-public-links/{token}")
        assert response.status_code == 200
        body = response.get_json()
        assert body["id"] == collection_ids[i]
        assert body["name"] == f"Shared collection {i}"

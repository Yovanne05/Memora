"""Tests for GET /collections/{collection_id}/public-links endpoint"""
from utils.enums import SharePermissionEnum


def test_list_collection_share_links_returns_empty_list(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/collections/{data.collection_id}/public-links")

    assert response.status_code == 200
    body = response.get_json()
    assert "items" in body
    assert "total" in body
    assert isinstance(body["items"], list)
    assert len(body["items"]) == 0
    assert body["total"] == 0


def test_list_collection_share_links_returns_created_links(client_with_note_data):
    client, data = client_with_note_data

    # Create two share links
    payload1 = {"permission": SharePermissionEnum.READ.value}
    response1 = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload1
    )
    assert response1.status_code == 201

    payload2 = {"permission": SharePermissionEnum.WRITE.value}
    response2 = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload2
    )
    assert response2.status_code == 201

    # List share links
    response = client.get(f"/collections/{data.collection_id}/public-links")

    assert response.status_code == 200
    body = response.get_json()
    items = body["items"]
    assert isinstance(items, list)
    assert len(items) == 2
    assert body["total"] == 2
    assert all("id" in link for link in items)
    assert all("collection_id" in link for link in items)
    assert all("permission" in link for link in items)
    assert all("created_at" in link for link in items)


def test_list_collection_share_links_filters_by_collection_id(client_with_note_data):
    client, data = client_with_note_data

    # Create another collection
    other_collection_id = data.create_collection(name="Other collection")

    # Create share link for first collection
    payload1 = {"permission": SharePermissionEnum.READ.value}
    response1 = client.post(
        f"/collections/{data.collection_id}/public-links", json=payload1
    )
    assert response1.status_code == 201

    # Create share link for second collection
    payload2 = {"permission": SharePermissionEnum.WRITE.value}
    response2 = client.post(
        f"/collections/{other_collection_id}/public-links", json=payload2
    )
    assert response2.status_code == 201

    # List share links for first collection only
    response = client.get(f"/collections/{data.collection_id}/public-links")

    assert response.status_code == 200
    body = response.get_json()
    items = body["items"]
    assert isinstance(items, list)
    assert len(items) == 1
    assert body["total"] == 1
    assert items[0]["collection_id"] == data.collection_id


def test_list_collection_share_links_requires_authentication(app_client):
    from uuid import uuid4

    collection_id = str(uuid4())

    response = app_client.get(f"/collections/{collection_id}/public-links")

    assert response.status_code == 401


def test_list_collection_share_links_requires_ownership(client_with_note_data):
    client, data = client_with_note_data

    # Create collection as share_user
    other_collection_id = data.create_collection(owner_id=data.share_user_id)

    # Try to list share links for collection we don't own
    response = client.get(f"/collections/{other_collection_id}/public-links")

    assert response.status_code == 200
    body = response.get_json()
    # Should return empty list since we don't own the collection
    assert isinstance(body["items"], list)
    assert len(body["items"]) == 0

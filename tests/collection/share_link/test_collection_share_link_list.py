"""Tests for GET /collection-share-links endpoint"""
from utils.enums import SharePermissionEnum


def test_list_collection_share_links_returns_empty_list(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/collection-share-links?collectionId={data.collection_id}")

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
        f"/collection-share-links/{data.collection_id}", json=payload1
    )
    assert response1.status_code == 201

    payload2 = {"permission": SharePermissionEnum.WRITE.value}
    response2 = client.post(
        f"/collection-share-links/{data.collection_id}", json=payload2
    )
    assert response2.status_code == 201

    # List share links
    response = client.get(f"/collection-share-links?collectionId={data.collection_id}")

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
        f"/collection-share-links/{data.collection_id}", json=payload1
    )
    assert response1.status_code == 201

    # Create share link for second collection
    payload2 = {"permission": SharePermissionEnum.WRITE.value}
    response2 = client.post(
        f"/collection-share-links/{other_collection_id}", json=payload2
    )
    assert response2.status_code == 201

    # List share links for first collection only
    response = client.get(f"/collection-share-links?collectionId={data.collection_id}")

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

    response = app_client.get(f"/collection-share-links?collectionId={collection_id}")

    assert response.status_code == 401


def test_list_collection_share_links_requires_ownership(client_with_note_data):
    client, data = client_with_note_data

    # Create collection as share_user
    other_collection_id = data.create_collection(owner_id=data.share_user_id)

    # Try to list share links for collection we don't own
    response = client.get(f"/collection-share-links?collectionId={other_collection_id}")

    assert response.status_code == 200
    body = response.get_json()
    # Should return empty list since we don't own the collection
    assert isinstance(body["items"], list)
    assert len(body["items"]) == 0


def test_list_collection_share_links_ordered_by_created_at(client_with_note_data):
    client, data = client_with_note_data

    # Create multiple share links
    for i in range(3):
        payload = {"permission": SharePermissionEnum.READ.value}
        response = client.post(
            f"/collection-share-links/{data.collection_id}", json=payload
        )
        assert response.status_code == 201

    # List share links
    response = client.get(
        f"/collection-share-links?collectionId={data.collection_id}&sortBy=created_at"
    )

    assert response.status_code == 200
    body = response.get_json()
    items = body["items"]
    assert len(items) == 3

    # Verify they are ordered by created_at (ascending by default)
    for i in range(len(items) - 1):
        assert items[i]["created_at"] <= items[i + 1]["created_at"]


def test_list_collection_share_links_with_limit(client_with_note_data):
    client, data = client_with_note_data

    # Create 5 share links
    for i in range(5):
        payload = {"permission": SharePermissionEnum.READ.value}
        response = client.post(
            f"/collection-share-links/{data.collection_id}", json=payload
        )
        assert response.status_code == 201

    # List with limit
    response = client.get(
        f"/collection-share-links?collectionId={data.collection_id}&limit=2"
    )

    assert response.status_code == 200
    body = response.get_json()
    assert len(body["items"]) == 2


def test_list_collection_share_links_with_invalid_limit(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(
        f"/collection-share-links?collectionId={data.collection_id}&limit=0"
    )

    assert response.status_code == 422


def test_list_collection_share_links_with_invalid_sort_by(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(
        f"/collection-share-links?collectionId={data.collection_id}&sortBy=invalid"
    )

    assert response.status_code == 422

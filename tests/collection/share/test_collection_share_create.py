"""Tests for POST /collection-shares/{collection_id} endpoint"""
from utils.enums import SharePermissionEnum


def test_share_collection_returns_created_share(client_with_collection_data):
    client, data = client_with_collection_data
    payload = {
        "user_id": data.share_user_id,
        "permission": SharePermissionEnum.WRITE.value,
    }

    response = client.post(f"/collection-shares/{data.collection_id}", json=payload)
    assert response.status_code == 201
    body = response.get_json()
    assert body["collection_id"] == data.collection_id
    assert body["user_id"] == data.share_user_id
    assert body["permission"] == SharePermissionEnum.WRITE.value
    data.track_created_share(data.collection_id, data.share_user_id)

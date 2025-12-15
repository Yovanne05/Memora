"""Tests for PATCH /collection-shares/{collection_id}/shares/{user_id} endpoint"""
from utils.enums import SharePermissionEnum


def test_update_share_returns_updated_share(client_with_collection_data):
    client, data = client_with_collection_data
    data.ensure_share()
    payload = {"permission": SharePermissionEnum.WRITE.value}

    response = client.patch(
        f"/collection-shares/{data.collection_id}/shares/{data.share_user_id}",
        json=payload,
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["permission"] == SharePermissionEnum.WRITE.value

"""Tests for DELETE /collection-shares/{collection_id}/shares/{user_id} endpoint"""


def test_revoke_share_calls_service(client_with_collection_data):
    client, data = client_with_collection_data
    data.ensure_share()

    response = client.delete(
        f"/collection-shares/{data.collection_id}/shares/{data.share_user_id}"
    )

    assert response.status_code == 204

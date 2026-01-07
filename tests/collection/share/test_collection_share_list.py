"""Tests for GET /collections/{collection_id}/shares endpoint"""


def test_list_shares_returns_items(client_with_collection_data):
    client, data = client_with_collection_data
    data.ensure_share(client)

    response = client.get(f"/collections/{data.collection_id}/shares")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert len(payload["items"]) == 1
    assert payload["items"][0]["user_id"] == data.share_user_id

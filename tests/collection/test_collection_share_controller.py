from utils.enums import SharePermissionEnum


def test_list_shares_returns_items(client_with_collection_data):
    client, data = client_with_collection_data
    data.ensure_share()

    response = client.get(
        "/collection-shares", query_string={"collectionId": data.collection_id}
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert len(payload["items"]) == 1
    assert payload["items"][0]["user_id"] == data.share_user_id


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


def test_revoke_share_calls_service(client_with_collection_data):
    client, data = client_with_collection_data
    data.ensure_share()

    response = client.delete(
        f"/collection-shares/{data.collection_id}/shares/{data.share_user_id}"
    )

    assert response.status_code == 204

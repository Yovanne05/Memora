from conftest import COLLECTION_ID, SHARE_USER_ID
from utils.enums import SharePermissionEnum


def test_list_shares_returns_items(client_with_collection_share_stub):
    client, share_stub = client_with_collection_share_stub
    response = client.get(f"/collections/{COLLECTION_ID}/shares")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["user_id"] == SHARE_USER_ID
    assert share_stub.last_list_collection_id == COLLECTION_ID


def test_share_collection_returns_created_share(client_with_collection_share_stub):
    client, share_stub = client_with_collection_share_stub
    payload = {
        "user_id": SHARE_USER_ID,
        "permission": SharePermissionEnum.WRITE.value,
    }

    response = client.post(
        f"/collections/{COLLECTION_ID}/shares", json=payload
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["collection_id"] == COLLECTION_ID
    assert body["user_id"] == SHARE_USER_ID
    assert body["permission"] == SharePermissionEnum.WRITE.value
    share_call = share_stub.last_share_payload
    assert share_call[0] == COLLECTION_ID
    assert share_call[1].permission == SharePermissionEnum.WRITE


def test_update_share_returns_updated_share(client_with_collection_share_stub):
    client, share_stub = client_with_collection_share_stub
    payload = {"permission": SharePermissionEnum.WRITE.value}

    response = client.patch(
        f"/collections/{COLLECTION_ID}/shares/{SHARE_USER_ID}", json=payload
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["permission"] == SharePermissionEnum.WRITE.value
    update_call = share_stub.last_update_payload
    assert update_call[0] == COLLECTION_ID
    assert update_call[1] == SHARE_USER_ID


def test_revoke_share_calls_service(client_with_collection_share_stub):
    client, share_stub = client_with_collection_share_stub

    response = client.delete(
        f"/collections/{COLLECTION_ID}/shares/{SHARE_USER_ID}"
    )

    assert response.status_code == 204
    assert share_stub.revoked == (COLLECTION_ID, SHARE_USER_ID)

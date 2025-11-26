from utils.enums import SharePermissionEnum


def test_list_shares_returns_items(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()

    response = client.get(f"/notes/{data.note_id}/shares")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["user_id"] == data.share_user_id


def test_share_note_returns_created_share(client_with_note_data):
    client, data = client_with_note_data
    payload = {"user_id": data.share_user_id, "permission": SharePermissionEnum.WRITE.value}

    response = client.post(f"/notes/{data.note_id}/shares", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == data.note_id
    assert body["user_id"] == data.share_user_id
    assert body["permission"] == SharePermissionEnum.WRITE.value
    data.track_created_share(data.note_id, data.share_user_id)


def test_update_share_returns_updated_share(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()
    payload = {"permission": SharePermissionEnum.WRITE.value}

    response = client.patch(
        f"/notes/{data.note_id}/shares/{data.share_user_id}",
        json=payload,
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["permission"] == SharePermissionEnum.WRITE.value


def test_revoke_share_calls_service(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()

    response = client.delete(
        f"/notes/{data.note_id}/shares/{data.share_user_id}"
    )

    assert response.status_code == 204

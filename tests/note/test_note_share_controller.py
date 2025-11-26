from conftest import NOTE_ID, SHARE_USER_ID
from utils.enums import SharePermissionEnum


def test_list_shares_returns_items(client_with_note_stubs):
    client, _, share_stub = client_with_note_stubs
    # When
    response = client.get(f"/notes/{NOTE_ID}/shares")
    # Then
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["user_id"] == SHARE_USER_ID
    assert share_stub.last_list_note_id == NOTE_ID


def test_share_note_returns_created_share(client_with_note_stubs):
    client, _, share_stub = client_with_note_stubs
    # Given
    payload = {"user_id": SHARE_USER_ID, "permission": SharePermissionEnum.WRITE.value}
    # When
    response = client.post(f"/notes/{NOTE_ID}/shares", json=payload)
    # Then
    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == NOTE_ID
    assert body["user_id"] == SHARE_USER_ID
    assert body["permission"] == SharePermissionEnum.WRITE.value
    share_call = share_stub.last_share_payload
    assert share_call[0] == NOTE_ID
    assert share_call[1].permission == SharePermissionEnum.WRITE


def test_update_share_returns_updated_share(client_with_note_stubs):
    client, _, share_stub = client_with_note_stubs
    # Given
    payload = {"permission": SharePermissionEnum.WRITE.value}
    # When
    response = client.patch(f"/notes/{NOTE_ID}/shares/{SHARE_USER_ID}", json=payload)
    # Then
    assert response.status_code == 200
    body = response.get_json()
    assert body["permission"] == SharePermissionEnum.WRITE.value
    update_call = share_stub.last_update_payload
    assert update_call[0] == NOTE_ID
    assert update_call[1] == SHARE_USER_ID


def test_revoke_share_calls_service(client_with_note_stubs):
    client, _, share_stub = client_with_note_stubs
    # When
    response = client.delete(f"/notes/{NOTE_ID}/shares/{SHARE_USER_ID}")
    # Then
    assert response.status_code == 204
    assert share_stub.revoked == (NOTE_ID, SHARE_USER_ID)

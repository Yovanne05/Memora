from http import HTTPStatus


def test_notes_shares_list_success(app_client, owner_context, other_user) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]
    target_user_id = other_user["user"]["id"]

    create_response = app_client.post(
        f"/notes/{note_id}/shares",
        json = {"user_id" : target_user_id, "permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.get(f"/notes/{note_id}/shares", headers = headers)

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["user"]["id"] == target_user_id for item in body["items"])

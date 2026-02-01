from http import HTTPStatus


def test_collections_shares_list_success(app_client, owner_context, other_user) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]
    target_user_id = other_user["user"]["id"]

    create_response = app_client.post(
        f"/collections/{collection_id}/shares",
        json = {"user_id" : target_user_id, "permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.get(
        f"/collections/{collection_id}/shares", headers = headers
    )

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["user"]["id"] == target_user_id for item in body["items"])

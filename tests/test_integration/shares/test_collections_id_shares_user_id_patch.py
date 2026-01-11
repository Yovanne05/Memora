from http import HTTPStatus


def test_collections_shares_update_success(app_client, owner_context, other_user) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]
    target_user_id = other_user["user"]["id"]

    create_response = app_client.post(
        f"/collections/{collection_id}/shares",
        json = {"user_id" : target_user_id, "permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.patch(
        f"/collections/{collection_id}/shares/{target_user_id}",
        json = {"permission" : "write"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["permission"] == "write"

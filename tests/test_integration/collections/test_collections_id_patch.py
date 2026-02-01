from http import HTTPStatus


def test_collections_update_success(app_client, auth_context, collection_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)

    updated_name = f"Updated {collection['name']}"
    response = app_client.patch(
        f"/collections/{collection['id']}",
        json = {"name" : updated_name},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["name"] == updated_name

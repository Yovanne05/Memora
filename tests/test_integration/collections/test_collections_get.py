from http import HTTPStatus


def test_collections_list_includes_created(app_client, auth_context, collection_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)

    response = app_client.get("/collections", headers = headers)

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["id"] == collection["id"] for item in body["items"])


def test_collections_list_requires_auth(app_client) :
    response = app_client.get("/collections")

    assert response.status_code == HTTPStatus.UNAUTHORIZED

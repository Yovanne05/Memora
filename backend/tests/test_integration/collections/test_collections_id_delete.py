from http import HTTPStatus


def test_collections_delete_success(app_client, auth_context, collection_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)

    response = app_client.delete(
        f"/collections/{collection['id']}", headers = headers
    )

    assert response.status_code == HTTPStatus.NO_CONTENT

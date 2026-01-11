from http import HTTPStatus


def test_collections_favorites_delete_success(app_client, owner_context) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]

    create_response = app_client.post(
        f"/collections/{collection_id}/favorites", headers = headers
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.delete(
        f"/collections/{collection_id}/favorites", headers = headers
    )

    assert response.status_code == HTTPStatus.NO_CONTENT


def test_collections_favorites_delete_missing(app_client, owner_context) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]

    response = app_client.delete(
        f"/collections/{collection_id}/favorites", headers = headers
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

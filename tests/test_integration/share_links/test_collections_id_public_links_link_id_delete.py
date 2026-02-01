from http import HTTPStatus
from uuid import uuid4


def test_collections_public_links_delete_success(app_client, owner_context) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]

    create_response = app_client.post(
        f"/collections/{collection_id}/public-links",
        json = {"permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED
    link = create_response.get_json()

    response = app_client.delete(
        f"/collections/{collection_id}/public-links/{link['id']}",
        headers = headers,
    )

    assert response.status_code == HTTPStatus.NO_CONTENT


def test_collections_public_links_delete_missing(app_client, owner_context) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]

    response = app_client.delete(
        f"/collections/{collection_id}/public-links/{uuid4()}",
        headers = headers,
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

from http import HTTPStatus
from uuid import uuid4


def test_collections_shares_delete_success(app_client, owner_context, other_user) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]
    target_user_id = other_user["user"]["id"]

    create_response = app_client.post(
        f"/collections/{collection_id}/shares",
        json = {"user_id" : target_user_id, "permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.delete(
        f"/collections/{collection_id}/shares/{target_user_id}",
        headers = headers,
    )

    assert response.status_code == HTTPStatus.NO_CONTENT


def test_collections_shares_delete_missing_returns_404(app_client, owner_context) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]

    response = app_client.delete(
        f"/collections/{collection_id}/shares/{uuid4()}",
        headers = headers,
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

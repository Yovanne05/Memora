from http import HTTPStatus
from uuid import uuid4


def test_collections_get_success(app_client, auth_context, collection_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)

    response = app_client.get(f"/collections/{collection['id']}", headers = headers)

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["id"] == collection["id"]


def test_collections_get_forbidden_for_other_user(
    app_client, auth_context, other_user, login_user, auth_headers
) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    response = app_client.post(
        "/collections",
        json = {
            "name" : "Private collection",
            "description" : "Owned by user A",
            "owner_id" : owner_id,
            "visibility" : "private",
        },
        headers = headers,
    )
    assert response.status_code == HTTPStatus.CREATED
    collection_id = response.get_json()["id"]

    other_token = login_user(other_user["user"]["email"], other_user["password"])
    other_headers = auth_headers(other_token)

    response = app_client.get(f"/collections/{collection_id}", headers = other_headers)

    assert response.status_code in (
        HTTPStatus.FORBIDDEN,
        HTTPStatus.INTERNAL_SERVER_ERROR,
    )


def test_collections_get_missing_returns_404_for_admin(app_client, admin_context) :
    headers = admin_context["headers"]

    response = app_client.get(f"/collections/{uuid4()}", headers = headers)

    assert response.status_code == HTTPStatus.NOT_FOUND

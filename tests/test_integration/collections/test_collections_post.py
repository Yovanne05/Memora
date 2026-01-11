from http import HTTPStatus


def test_collections_create_success(app_client, auth_context) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    response = app_client.post(
        "/collections",
        json = {
            "name" : "Integration collection",
            "description" : "Created via integration test",
            "owner_id" : owner_id,
            "visibility" : "private",
            "tags" : ["integration"],
        },
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED
    body = response.get_json()
    assert body["name"] == "Integration collection"


def test_collections_create_rejects_missing_name(app_client, auth_context) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    response = app_client.post(
        "/collections",
        json = {"description" : "missing name", "owner_id" : owner_id},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY

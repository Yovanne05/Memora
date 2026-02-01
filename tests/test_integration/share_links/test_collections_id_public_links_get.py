from http import HTTPStatus


def test_collections_public_links_list_success(app_client, owner_context) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]

    create_response = app_client.post(
        f"/collections/{collection_id}/public-links",
        json = {"permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED
    link = create_response.get_json()

    response = app_client.get(
        f"/collections/{collection_id}/public-links", headers = headers
    )

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["id"] == link["id"] for item in body["items"])

from http import HTTPStatus


def test_collections_reports_create_success(app_client, owner_context) :
    headers = owner_context["headers"]
    collection_id = owner_context["collection"]["id"]

    response = app_client.post(
        f"/collections/{collection_id}/reports",
        json = {"reason" : "technical_issue"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED

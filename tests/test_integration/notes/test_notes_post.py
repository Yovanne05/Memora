from http import HTTPStatus


def test_notes_create_success(app_client, auth_context, collection_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]
    collection = collection_factory(headers, owner_id)

    response = app_client.post(
        "/notes",
        json = {
            "title" : "Integration note",
            "content" : "Integration content",
            "owner_id" : owner_id,
            "collection_id" : collection["id"],
            "visibility" : "private",
            "tags" : ["integration"],
        },
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED
    body = response.get_json()
    assert body["title"] == "Integration note"


def test_notes_create_rejects_missing_title(app_client, auth_context) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    response = app_client.post(
        "/notes",
        json = {"owner_id" : owner_id, "content" : "missing title"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_notes_create_rejects_duplicate_title(
    app_client, auth_context, collection_factory, note_factory
) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]
    collection = collection_factory(headers, owner_id)

    note_factory(headers, owner_id, collection["id"], title = "Same title")

    response = app_client.post(
        "/notes",
        json = {
            "title" : "Same title",
            "content" : "duplicate",
            "owner_id" : owner_id,
            "collection_id" : collection["id"],
            "visibility" : "private",
        },
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CONFLICT

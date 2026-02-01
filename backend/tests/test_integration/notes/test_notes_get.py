from http import HTTPStatus


def test_notes_list_includes_created(app_client, auth_context, collection_factory, note_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    note = note_factory(headers, owner_id, collection["id"])

    response = app_client.get("/notes", headers = headers)

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["id"] == note["id"] for item in body["items"])


def test_notes_list_requires_auth(app_client) :
    response = app_client.get("/notes")

    assert response.status_code == HTTPStatus.UNAUTHORIZED

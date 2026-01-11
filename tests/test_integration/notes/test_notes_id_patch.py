from http import HTTPStatus


def test_notes_update_success(app_client, auth_context, collection_factory, note_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    note = note_factory(headers, owner_id, collection["id"])

    updated_title = f"Updated {note['title']}"
    response = app_client.patch(
        f"/notes/{note['id']}",
        json = {"title" : updated_title},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["title"] == updated_title

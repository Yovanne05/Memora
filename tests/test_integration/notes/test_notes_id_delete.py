from http import HTTPStatus


def test_notes_delete_success(app_client, auth_context, collection_factory, note_factory) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    note = note_factory(headers, owner_id, collection["id"])

    response = app_client.delete(f"/notes/{note['id']}", headers = headers)

    assert response.status_code == HTTPStatus.NO_CONTENT

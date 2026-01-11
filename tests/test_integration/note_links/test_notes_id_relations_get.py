from http import HTTPStatus


def test_notes_relations_list_success(
    app_client, auth_context, collection_factory, note_factory
) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    note_one = note_factory(headers, owner_id, collection["id"], title = "Note A")
    note_two = note_factory(headers, owner_id, collection["id"], title = "Note B")

    create_response = app_client.post(
        f"/notes/{note_one['id']}/relations",
        json = {"linked_note_id" : note_two["id"], "label" : "related"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.get(
        f"/notes/{note_one['id']}/relations", headers = headers
    )

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["linked_note_id"] == note_two["id"] for item in body["items"])

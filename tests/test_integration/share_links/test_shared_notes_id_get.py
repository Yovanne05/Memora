from http import HTTPStatus


def test_shared_notes_get_success(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    create_response = app_client.post(
        f"/notes/{note_id}/public-links",
        json = {"permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED
    link = create_response.get_json()

    response = app_client.get(f"/shared/notes/{link['id']}")

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["id"] == note_id

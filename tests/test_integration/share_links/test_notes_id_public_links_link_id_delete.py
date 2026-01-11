from http import HTTPStatus


def test_notes_public_links_delete_success(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    create_response = app_client.post(
        f"/notes/{note_id}/public-links",
        json = {"permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED
    link = create_response.get_json()

    response = app_client.delete(
        f"/notes/{note_id}/public-links/{link['id']}", headers = headers
    )

    assert response.status_code == HTTPStatus.NO_CONTENT


def test_notes_public_links_delete_missing(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.delete(
        f"/notes/{note_id}/public-links/00000000-0000-0000-0000-000000000000",
        headers = headers,
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

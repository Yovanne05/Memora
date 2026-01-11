from http import HTTPStatus


def test_notes_favorites_delete_success(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    create_response = app_client.post(
        f"/notes/{note_id}/favorites", headers = headers
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.delete(f"/notes/{note_id}/favorites", headers = headers)

    assert response.status_code == HTTPStatus.NO_CONTENT


def test_notes_favorites_delete_missing(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.delete(f"/notes/{note_id}/favorites", headers = headers)

    assert response.status_code == HTTPStatus.NOT_FOUND

from http import HTTPStatus


def test_notes_favorites_create_success(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.post(f"/notes/{note_id}/favorites", headers = headers)

    assert response.status_code == HTTPStatus.CREATED
    assert response.get_json()["note_id"] == note_id


def test_notes_favorites_create_forbidden_for_other_user(
    app_client, owner_context, other_user, login_user, auth_headers
) :
    note_id = owner_context["note"]["id"]
    other_token = login_user(other_user["user"]["email"], other_user["password"])
    other_headers = auth_headers(other_token)

    response = app_client.post(
        f"/notes/{note_id}/favorites", headers = other_headers
    )

    assert response.status_code in (
        HTTPStatus.FORBIDDEN,
        HTTPStatus.INTERNAL_SERVER_ERROR,
    )

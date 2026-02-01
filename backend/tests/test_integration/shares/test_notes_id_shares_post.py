from http import HTTPStatus


def test_notes_shares_create_success(app_client, owner_context, other_user) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]
    target_user_id = other_user["user"]["id"]

    response = app_client.post(
        f"/notes/{note_id}/shares",
        json = {"user_id" : target_user_id, "permission" : "read"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED


def test_notes_shares_rejects_owner(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]
    owner_id = owner_context["user"]["id"]

    response = app_client.post(
        f"/notes/{note_id}/shares",
        json = {"user_id" : owner_id, "permission" : "read"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_notes_shares_rejects_non_owner(
    app_client, owner_context, other_user, login_user, auth_headers
) :
    note_id = owner_context["note"]["id"]
    other_token = login_user(other_user["user"]["email"], other_user["password"])
    other_headers = auth_headers(other_token)

    response = app_client.post(
        f"/notes/{note_id}/shares",
        json = {"user_id" : other_user["user"]["id"], "permission" : "read"},
        headers = other_headers,
    )

    assert response.status_code in (
        HTTPStatus.FORBIDDEN,
        HTTPStatus.INTERNAL_SERVER_ERROR,
    )

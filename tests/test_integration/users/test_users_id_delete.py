from http import HTTPStatus


def test_users_delete_success(app_client, auth_context) :
    headers = auth_context["headers"]
    user_id = auth_context["user"]["id"]

    response = app_client.delete(f"/users/{user_id}", headers = headers)

    assert response.status_code == HTTPStatus.NO_CONTENT

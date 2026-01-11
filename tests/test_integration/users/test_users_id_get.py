from http import HTTPStatus


def test_users_get_by_id_success(app_client, make_user, login_user, auth_headers) :
    created_user, password = make_user()
    token = login_user(created_user["email"], password)
    headers = auth_headers(token)

    response = app_client.get(f"/users/{created_user['id']}", headers = headers)

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["id"] == created_user["id"]


def test_users_get_missing_returns_404(app_client, admin_context) :
    headers = admin_context["headers"]

    response = app_client.get(
        "/users/00000000-0000-0000-0000-000000000000", headers = headers
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

from http import HTTPStatus


def test_users_get_by_id_success(app_client, auth_context, make_user) :
    headers = auth_context["headers"]
    created_user, _ = make_user()

    response = app_client.get(f"/users/{created_user['id']}", headers = headers)

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["id"] == created_user["id"]


def test_users_get_missing_returns_404(app_client, auth_context) :
    headers = auth_context["headers"]

    response = app_client.get(
        "/users/00000000-0000-0000-0000-000000000000", headers = headers
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

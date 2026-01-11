from http import HTTPStatus


def test_users_list_includes_created_user(app_client, admin_context, make_user) :
    headers = admin_context["headers"]

    created_user, _ = make_user()

    response = app_client.get("/users", headers = headers)

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["id"] == created_user["id"] for item in body["items"])


def test_users_list_requires_auth(app_client) :
    response = app_client.get("/users")

    assert response.status_code == HTTPStatus.UNAUTHORIZED

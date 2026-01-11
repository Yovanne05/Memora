from http import HTTPStatus


def test_sessions_me_success(app_client, make_user, login_user, auth_headers) :
    user, password = make_user()
    token = login_user(user["email"], password)

    response = app_client.get("/sessions/me", headers = auth_headers(token))

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert body["user"]["id"] == user["id"]


def test_sessions_me_requires_auth(app_client) :
    response = app_client.get("/sessions/me")

    assert response.status_code == HTTPStatus.UNAUTHORIZED

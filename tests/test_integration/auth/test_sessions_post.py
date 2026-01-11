from http import HTTPStatus


def test_sessions_create_success(app_client, make_user) :
    user, password = make_user()

    response = app_client.post(
        "/sessions",
        json = {"identifier" : user["email"], "password" : password},
    )

    assert response.status_code == HTTPStatus.OK
    assert "access_token" in response.get_json()


def test_sessions_create_rejects_invalid_password(app_client, make_user) :
    user, _ = make_user()

    response = app_client.post(
        "/sessions",
        json = {"identifier" : user["email"], "password" : "WrongPass123!"},
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_sessions_create_rejects_missing_fields(app_client) :
    response = app_client.post("/sessions", json = {"identifier" : "user@example.com"})

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY

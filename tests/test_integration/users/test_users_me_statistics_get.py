from http import HTTPStatus


def test_users_me_statistics_success(app_client, auth_context) :
    headers = auth_context["headers"]

    response = app_client.get("/users/me/statistics", headers = headers)

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert "content_statistics" in body
    assert "review_statistics" in body

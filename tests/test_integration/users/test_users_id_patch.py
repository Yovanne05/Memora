from http import HTTPStatus


def test_users_update_success(app_client, auth_context) :
    headers = auth_context["headers"]
    user = auth_context["user"]

    updated_username = f"updated-{user['id'][:8]}"
    response = app_client.patch(
        f"/users/{user['id']}",
        json = {"username" : updated_username},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["username"] == updated_username

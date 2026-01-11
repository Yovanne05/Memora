from http import HTTPStatus
from uuid import uuid4


def test_users_create_success(app_client) :
    suffix = uuid4().hex[:8]

    response = app_client.post(
        "/users",
        json = {
            "email" : f"int-{suffix}@example.com",
            "username" : f"int-{suffix}",
            "password" : f"StrongPass1!{suffix}",
        },
    )

    assert response.status_code == HTTPStatus.CREATED


def test_users_create_rejects_weak_password(app_client) :
    response = app_client.post(
        "/users",
        json = {
            "email" : "weak-pass@example.com",
            "username" : "weakpass",
            "password" : "weak",
        },
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_users_create_rejects_duplicate_email(app_client, make_user) :
    user, _ = make_user()

    response = app_client.post(
        "/users",
        json = {
            "email" : user["email"],
            "username" : "another-user",
            "password" : "StrongPass1!duplicate",
        },
    )

    assert response.status_code == HTTPStatus.CONFLICT


def test_users_create_rejects_duplicate_username(app_client, make_user) :
    user, _ = make_user()

    response = app_client.post(
        "/users",
        json = {
            "email" : "unique@example.com",
            "username" : user["username"],
            "password" : "StrongPass1!duplicate",
        },
    )

    assert response.status_code == HTTPStatus.CONFLICT

from http import HTTPStatus


def test_users_me_statistics_timeseries_success(app_client, auth_context) :
    headers = auth_context["headers"]

    response = app_client.get(
        "/users/me/statistics/timeseries?metric = notes&days = 7", headers = headers
    )

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert body["metric"] == "notes"


def test_users_me_statistics_timeseries_invalid_metric(app_client, auth_context) :
    headers = auth_context["headers"]

    response = app_client.get(
        "/users/me/statistics/timeseries?metric=invalid&days=7", headers = headers
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_users_me_statistics_timeseries_invalid_days(app_client, auth_context) :
    headers = auth_context["headers"]

    response = app_client.get(
        "/users/me/statistics/timeseries?metric=notes&days=5", headers = headers
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY

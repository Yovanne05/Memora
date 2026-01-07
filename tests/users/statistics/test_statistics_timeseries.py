"""Tests for GET /users/me/statistics/timeseries endpoint"""


def test_get_timeseries_notes_default_params(client_with_note_data):
    """Test getting notes timeseries with default parameters (metric=notes, days=30)"""
    client, _ = client_with_note_data

    response = client.get("/users/me/statistics/timeseries")

    assert response.status_code == 200
    body = response.get_json()
    assert body["metric"] == "notes"
    assert body["days"] == 30
    assert "points" in body
    assert isinstance(body["points"], list)


def test_get_timeseries_with_metric_collections(client_with_note_data):
    """Test getting collections timeseries"""
    client, _ = client_with_note_data

    response = client.get("/users/me/statistics/timeseries?metric=collections")

    assert response.status_code == 200
    body = response.get_json()
    assert body["metric"] == "collections"
    assert body["days"] == 30
    assert "points" in body


def test_get_timeseries_with_metric_reviews(client_with_note_data):
    """Test getting reviews timeseries"""
    client, _ = client_with_note_data

    response = client.get("/users/me/statistics/timeseries?metric=reviews")

    assert response.status_code == 200
    body = response.get_json()
    assert body["metric"] == "reviews"
    assert body["days"] == 30
    assert "points" in body


def test_get_timeseries_with_days_7(client_with_note_data):
    """Test getting timeseries for last 7 days"""
    client, _ = client_with_note_data

    response = client.get("/users/me/statistics/timeseries?days=7")

    assert response.status_code == 200
    body = response.get_json()
    assert body["days"] == 7


def test_get_timeseries_with_days_90(client_with_note_data):
    """Test getting timeseries for last 90 days"""
    client, _ = client_with_note_data

    response = client.get("/users/me/statistics/timeseries?days=90")

    assert response.status_code == 200
    body = response.get_json()
    assert body["days"] == 90


def test_get_timeseries_with_both_params(client_with_note_data):
    """Test getting timeseries with both metric and days specified"""
    client, _ = client_with_note_data

    response = client.get(
        "/users/me/statistics/timeseries?metric=collections&days=7"
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["metric"] == "collections"
    assert body["days"] == 7


def test_get_timeseries_with_invalid_metric(client_with_note_data):
    """Test getting timeseries with invalid metric returns 422"""
    client, _ = client_with_note_data

    response = client.get("/users/me/statistics/timeseries?metric=invalid")

    assert response.status_code == 422


def test_get_timeseries_with_invalid_days(client_with_note_data):
    """Test getting timeseries with invalid days value returns 422"""
    client, _ = client_with_note_data

    response = client.get("/users/me/statistics/timeseries?days=15")

    assert response.status_code == 422


def test_get_timeseries_without_authentication(app_client):
    """Test that endpoint requires authentication"""
    client = app_client

    response = client.get("/users/me/statistics/timeseries")

    assert response.status_code == 401

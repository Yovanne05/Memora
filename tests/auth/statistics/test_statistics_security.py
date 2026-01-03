def test_get_statistics_requires_authentication(client):
    response = client.get("/auth/me/statistics")

    assert response.status_code == 401

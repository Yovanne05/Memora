def test_get_statistics_returns_empty_stats_for_new_user(client, register_user):
    _, _, _, token = register_user()

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesCreated"] == 0
    assert body["contentStatistics"]["collectionsCreated"] == 0
    assert body["contentStatistics"]["flashcardsCreated"] == 0
    assert body["contentStatistics"]["notesSharedByUser"] == 0
    assert body["contentStatistics"]["collectionsSharedByUser"] == 0
    assert body["reviewStatistics"] is None

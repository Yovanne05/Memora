def test_get_statistics_returns_empty_stats_for_new_user(client, register_user):
    _, _, _, token = register_user()

    response = client.get(
        "/users/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesCreated"] == 0
    assert body["contentStatistics"]["collectionsCreated"] == 0
    assert body["contentStatistics"]["flashcardsCreated"] == 0
    assert body["contentStatistics"]["notesSharedByUser"] == 0
    assert body["contentStatistics"]["collectionsSharedByUser"] == 0
    # reviewStatistics should be populated (not None) with zeros for new users
    assert body["reviewStatistics"] is not None
    assert body["reviewStatistics"]["totalReviews"] == 0
    assert body["reviewStatistics"]["reviewsLast7Days"] == 0
    assert body["reviewStatistics"]["reviewsLast30Days"] == 0
    assert body["reviewStatistics"]["averageQuality"] == 0.0

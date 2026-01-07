def test_get_statistics_returns_empty_stats_for_new_user(client, register_user):
    _, _, _, token = register_user()

    response = client.get(
        "/users/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["content_statistics"]["notes_created"] == 0
    assert body["content_statistics"]["collections_created"] == 0
    assert body["content_statistics"]["flashcards_created"] == 0
    assert body["content_statistics"]["notes_shared_by_user"] == 0
    assert body["content_statistics"]["collections_shared_by_user"] == 0
    # review_statistics should be populated (not None) with zeros for new users
    assert body["review_statistics"] is not None
    assert body["review_statistics"]["total_reviews"] == 0
    assert body["review_statistics"]["reviews_last_7_days"] == 0
    assert body["review_statistics"]["reviews_last_30_days"] == 0
    assert body["review_statistics"]["average_quality"] == 0.0

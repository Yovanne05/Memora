def test_get_statistics_with_complete_scenario(
    client,
    register_user,
    create_collection,
    create_note,
    create_flashcard,
    share_note,
    share_collection,
):
    _, _, user1_id, token1 = register_user()
    _, _, user2_id, _ = register_user()

    collection1_id = create_collection(token1, user1_id)
    collection2_id = create_collection(token1, user1_id)

    note1_id = create_note(token1, user1_id, collection1_id)
    note2_id = create_note(token1, user1_id, collection2_id)
    note3_id = create_note(token1, user1_id)

    create_flashcard(token1, note1_id)
    create_flashcard(token1, note1_id)
    create_flashcard(token1, note2_id)

    share_note(token1, note1_id, user2_id)
    share_collection(token1, collection1_id, user2_id)

    response = client.get(
        "/auth/me/statistics", headers={"Authorization": f"Bearer {token1}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesCreated"] == 3
    assert body["contentStatistics"]["collectionsCreated"] == 2
    assert body["contentStatistics"]["flashcardsCreated"] == 3
    assert body["contentStatistics"]["notesSharedByUser"] == 1
    assert body["contentStatistics"]["collectionsSharedByUser"] == 1

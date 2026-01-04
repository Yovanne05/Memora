def test_get_statistics_counts_shared_notes(
    client, register_user, create_note, share_note
):
    _, _, user1_id, token1 = register_user()
    _, _, user2_id, _ = register_user()
    note1_id = create_note(token1, user1_id)
    note2_id = create_note(token1, user1_id)
    share_note(token1, note1_id, user2_id)
    share_note(token1, note2_id, user2_id)

    response = client.get(
        "/users/me/statistics", headers={"Authorization": f"Bearer {token1}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["notesSharedByUser"] == 2


def test_get_statistics_counts_shared_collections(
    client, register_user, create_collection, share_collection
):
    _, _, user1_id, token1 = register_user()
    _, _, user2_id, _ = register_user()
    collection_id = create_collection(token1, user1_id)
    share_collection(token1, collection_id, user2_id)

    response = client.get(
        "/users/me/statistics", headers={"Authorization": f"Bearer {token1}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["contentStatistics"]["collectionsSharedByUser"] == 1

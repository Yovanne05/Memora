def test_get_statistics_counts_created_notes(
    client, register_user, create_note
):
    _, _, user_id, token = register_user()
    create_note(token, user_id)
    create_note(token, user_id)
    create_note(token, user_id)

    response = client.get(
        "/users/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["content_statistics"]["notes_created"] == 3


def test_get_statistics_counts_created_collections(
    client, register_user, create_collection
):
    _, _, user_id, token = register_user()
    create_collection(token, user_id)
    create_collection(token, user_id)

    response = client.get(
        "/users/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["content_statistics"]["collections_created"] == 2


def test_get_statistics_counts_created_flashcards(
    client, register_user, create_note, create_flashcard
):
    _, _, user_id, token = register_user()
    note_id = create_note(token, user_id)
    create_flashcard(token, note_id)
    create_flashcard(token, note_id)
    create_flashcard(token, note_id)

    response = client.get(
        "/users/me/statistics", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["content_statistics"]["flashcards_created"] == 3

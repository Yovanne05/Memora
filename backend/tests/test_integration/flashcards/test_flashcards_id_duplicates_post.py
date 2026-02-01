from http import HTTPStatus


def test_flashcards_duplicate_success(app_client, owner_context, flashcard_factory) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    flashcard = flashcard_factory(headers, note_id)

    response = app_client.post(
        f"/flashcards/{flashcard['id']}/duplicates", headers = headers
    )

    assert response.status_code == HTTPStatus.CREATED
    body = response.get_json()
    assert body["id"] != flashcard["id"]

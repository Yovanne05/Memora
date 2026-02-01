from http import HTTPStatus


def test_flashcards_delete_success(app_client, owner_context, flashcard_factory) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    flashcard = flashcard_factory(headers, note_id)

    response = app_client.delete(f"/flashcards/{flashcard['id']}", headers = headers)

    assert response.status_code == HTTPStatus.NO_CONTENT

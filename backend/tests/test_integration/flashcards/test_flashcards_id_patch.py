from http import HTTPStatus


def test_flashcards_update_success(app_client, owner_context, flashcard_factory) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    flashcard = flashcard_factory(headers, note_id)

    updated_question = f"Updated {flashcard['question']}"
    response = app_client.patch(
        f"/flashcards/{flashcard['id']}",
        json = {"question" : updated_question},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["question"] == updated_question

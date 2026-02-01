from http import HTTPStatus


def test_reviews_create_success(app_client, owner_context, flashcard_factory) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    flashcard = flashcard_factory(headers, note_id)
    selected_answer_id = flashcard["answers"][0]["id"]

    response = app_client.post(
        "/reviews",
        json = {
            "flashcard_id" : flashcard["id"],
            "selected_answer_id" : selected_answer_id,
            "difficulty" : "easy",
        },
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED
    assert response.get_json()["flashcard_id"] == flashcard["id"]


def test_reviews_create_rejects_invalid_difficulty(app_client, owner_context) :
    headers = owner_context["headers"]

    response = app_client.post(
        "/reviews",
        json = {
            "flashcard_id" : "invalid-id",
            "selected_answer_id" : "invalid-answer",
            "difficulty" : "invalid",
        },
        headers = headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY

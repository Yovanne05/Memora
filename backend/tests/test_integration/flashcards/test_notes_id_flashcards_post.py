from http import HTTPStatus


def test_notes_flashcards_create_success(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.post(
        f"/notes/{note_id}/flashcards",
        json = {
            "question" : "What is integration?",
            "answers" : [
                {"answer_text" : "Correct", "is_correct" : True},
                {"answer_text" : "Wrong", "is_correct" : False},
            ],
        },
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED
    assert response.get_json()["question"] == "What is integration?"


def test_notes_flashcards_rejects_no_correct_answer(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.post(
        f"/notes/{note_id}/flashcards",
        json = {
            "question" : "Invalid answers",
            "answers" : [
                {"answer_text" : "Wrong", "is_correct" : False},
                {"answer_text" : "Also wrong", "is_correct" : False},
            ],
        },
        headers = headers,
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_notes_flashcards_rejects_empty_answers(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.post(
        f"/notes/{note_id}/flashcards",
        json = {"question" : "No answers", "answers" : []},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY

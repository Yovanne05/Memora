from http import HTTPStatus


def test_reviews_list_success(app_client, owner_context, flashcard_factory) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    flashcard = flashcard_factory(headers, note_id)
    selected_answer_id = flashcard["answers"][0]["id"]

    create_response = app_client.post(
        "/reviews",
        json = {
            "flashcard_id" : flashcard["id"],
            "selected_answer_id" : selected_answer_id,
            "difficulty" : "easy",
        },
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.get("/reviews?status = upcoming", headers = headers)

    assert response.status_code == HTTPStatus.OK
    assert isinstance(response.get_json(), list)


def test_reviews_list_rejects_invalid_status(app_client, owner_context) :
    headers = owner_context["headers"]

    response = app_client.get("/reviews?status=invalid", headers = headers)

    assert response.status_code == HTTPStatus.BAD_REQUEST

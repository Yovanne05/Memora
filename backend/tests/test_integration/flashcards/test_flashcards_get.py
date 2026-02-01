from http import HTTPStatus


def test_flashcards_list_includes_created(app_client, owner_context, flashcard_factory) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    flashcard = flashcard_factory(headers, note_id)

    response = app_client.get("/flashcards", headers = headers)

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["id"] == flashcard["id"] for item in body["items"])


def test_flashcards_list_requires_auth(app_client) :
    response = app_client.get("/flashcards")

    assert response.status_code == HTTPStatus.UNAUTHORIZED

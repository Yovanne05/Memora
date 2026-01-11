from http import HTTPStatus
from uuid import uuid4


def test_flashcards_get_success(app_client, owner_context, flashcard_factory) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    flashcard = flashcard_factory(headers, note_id)

    response = app_client.get(f"/flashcards/{flashcard['id']}", headers = headers)

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["id"] == flashcard["id"]


def test_flashcards_get_missing_returns_404(app_client, auth_context) :
    headers = auth_context["headers"]

    response = app_client.get(f"/flashcards/{uuid4()}", headers = headers)

    assert response.status_code == HTTPStatus.NOT_FOUND

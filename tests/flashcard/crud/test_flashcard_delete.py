"""Tests for DELETE /flashcards/{flashcard_id} endpoint"""


def test_delete_flashcard(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "To delete?",
        "answers": [{"answer_text": "Yes", "is_correct": True}],
    }

    create_response = client.post(
        f"/notes/{data.note_id}/flashcards", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    response = client.delete(f"/flashcards/{flashcard_id}")

    assert response.status_code == 204

    get_response = client.get(f"/flashcards/{flashcard_id}")
    assert get_response.status_code == 404


def test_delete_flashcard_removes_answers(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Question?",
        "answers": [
            {"answer_text": "Answer 1", "is_correct": True},
            {"answer_text": "Answer 2", "is_correct": False},
        ],
    }

    create_response = client.post(
        f"/notes/{data.note_id}/flashcards", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    client.delete(f"/flashcards/{flashcard_id}")

    response = client.get(f"/notes/{data.note_id}/flashcards")
    assert response.status_code == 200
    body = response.get_json()
    assert body["total"] == 0
    assert body["items"] == []


def test_delete_nonexistent_flashcard_returns_404(client_with_note_data):
    client, _ = client_with_note_data

    response = client.delete(
        "/flashcards/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404

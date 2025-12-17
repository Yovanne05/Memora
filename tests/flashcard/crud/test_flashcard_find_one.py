"""Tests for GET /flashcards/{flashcard_id} endpoint"""


def test_find_one_flashcard_returns_flashcard(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Test question?",
        "answers": [{"answer_text": "Test answer", "is_correct": True}],
    }

    create_response = client.post(
        f"/flashcards/{data.note_id}", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    response = client.get(f"/flashcards/{flashcard_id}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["id"] == flashcard_id
    assert body["question"] == "Test question?"


def test_find_one_nonexistent_flashcard_returns_404(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get("/flashcards/00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404

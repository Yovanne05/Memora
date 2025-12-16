"""Tests for POST /flashcards/{flashcard_id}/duplicate endpoint"""


def test_duplicate_flashcard_in_same_note(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Original question?",
        "answers": [
            {"answer_text": "Answer 1", "is_correct": True},
            {"answer_text": "Answer 2", "is_correct": False},
        ],
    }

    create_response = client.post(
        f"/flashcards/{data.note_id}", json=payload
    )
    original_flashcard = create_response.get_json()
    original_id = original_flashcard["id"]

    duplicate_response = client.post(
        f"/flashcards/{original_id}/duplicate"
    )

    assert duplicate_response.status_code == 201
    duplicated = duplicate_response.get_json()
    assert duplicated["id"] != original_id
    assert duplicated["note_id"] == data.note_id
    assert duplicated["question"] == "Original question?"
    assert len(duplicated["answers"]) == 2
    assert duplicated["answers"][0]["answer_text"] == "Answer 1"
    assert duplicated["answers"][0]["is_correct"] is True
    assert duplicated["answers"][1]["answer_text"] == "Answer 2"
    assert duplicated["answers"][1]["is_correct"] is False
    assert duplicated["answers"][0]["id"] != original_flashcard["answers"][0]["id"]


def test_duplicate_flashcard_without_body(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Question?",
        "answers": [{"answer_text": "Answer", "is_correct": True}],
    }

    create_response = client.post(
        f"/flashcards/{data.note_id}", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    duplicate_response = client.post(
        f"/flashcards/{flashcard_id}/duplicate"
    )

    assert duplicate_response.status_code == 201
    duplicated = duplicate_response.get_json()
    assert duplicated["note_id"] == data.note_id


def test_duplicate_nonexistent_flashcard_returns_404(client_with_note_data):
    client, _ = client_with_note_data

    response = client.post(
        "/flashcards/00000000-0000-0000-0000-000000000000/duplicate"
    )

    assert response.status_code == 404

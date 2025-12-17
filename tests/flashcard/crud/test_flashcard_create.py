"""Tests for POST /flashcards/{note_id} endpoint"""


def test_create_flashcard_with_single_answer(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "What is the capital of France?",
        "answers": [{"answer_text": "Paris", "is_correct": True}],
    }

    response = client.post(f"/flashcards/{data.note_id}", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "What is the capital of France?"
    assert len(body["answers"]) == 1
    assert body["answers"][0]["answer_text"] == "Paris"
    assert body["answers"][0]["is_correct"] is True
    assert "id" in body
    assert body["note_id"] == data.note_id


def test_create_flashcard_with_multiple_answers(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "What is the keyword for a condition?",
        "answers": [
            {"answer_text": "if", "is_correct": True},
            {"answer_text": "for", "is_correct": False},
            {"answer_text": "def", "is_correct": False},
        ],
    }

    response = client.post(f"/flashcards/{data.note_id}", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "What is the keyword for a condition?"
    assert len(body["answers"]) == 3


def test_create_flashcard_with_multiple_correct_answers(
    client_with_note_data,
):
    client, data = client_with_note_data
    payload = {
        "question": "Which of these are programming languages?",
        "answers": [
            {"answer_text": "Python", "is_correct": True},
            {"answer_text": "JavaScript", "is_correct": True},
            {"answer_text": "HTML", "is_correct": False},
        ],
    }

    response = client.post(f"/flashcards/{data.note_id}", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "Which of these are programming languages?"
    assert len(body["answers"]) == 3
    correct_count = sum(1 for a in body["answers"] if a["is_correct"])
    assert correct_count == 2


def test_create_flashcard_without_answers_returns_400(client_with_note_data):
    client, data = client_with_note_data
    payload = {"question": "What is Python?", "answers": []}

    response = client.post(f"/flashcards/{data.note_id}", json=payload)

    assert response.status_code == 422


def test_create_flashcard_without_correct_answer_returns_400(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "What is Python?",
        "answers": [
            {"answer_text": "if", "is_correct": False},
            {"answer_text": "for", "is_correct": False},
        ],
    }

    response = client.post(f"/flashcards/{data.note_id}", json=payload)

    assert response.status_code == 400


def test_create_flashcard_for_nonexistent_note_returns_404(client_with_note_data):
    client, _ = client_with_note_data
    payload = {
        "question": "Test",
        "answers": [{"answer_text": "Answer", "is_correct": True}],
    }

    response = client.post(
        "/flashcards/00000000-0000-0000-0000-000000000000", json=payload
    )

    assert response.status_code == 404

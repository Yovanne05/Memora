"""Tests for PATCH /flashcards/{flashcard_id} endpoint"""


def test_update_flashcard_question(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Old question?",
        "answers": [{"answer_text": "Answer", "is_correct": True}],
    }

    create_response = client.post(
        f"/notes/{data.note_id}/flashcards", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    update_payload = {"question": "New question?"}
    response = client.patch(
        f"/flashcards/{flashcard_id}", json=update_payload
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["question"] == "New question?"
    assert len(body["answers"]) == 1


def test_update_flashcard_answers(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Question?",
        "answers": [{"answer_text": "Old answer", "is_correct": True}],
    }

    create_response = client.post(
        f"/notes/{data.note_id}/flashcards", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    update_payload = {
        "answers": [
            {"answer_text": "New answer 1", "is_correct": True},
            {"answer_text": "New answer 2", "is_correct": False},
        ]
    }
    response = client.patch(
        f"/flashcards/{flashcard_id}", json=update_payload
    )

    assert response.status_code == 200
    body = response.get_json()
    assert len(body["answers"]) == 2
    assert body["answers"][0]["answer_text"] == "New answer 1"
    assert body["answers"][1]["answer_text"] == "New answer 2"


def test_update_flashcard_with_empty_answers_returns_400(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Question?",
        "answers": [{"answer_text": "Answer", "is_correct": True}],
    }

    create_response = client.post(
        f"/notes/{data.note_id}/flashcards", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    update_payload = {"answers": []}
    response = client.patch(
        f"/flashcards/{flashcard_id}", json=update_payload
    )

    assert response.status_code == 422


def test_update_nonexistent_flashcard_returns_404(client_with_note_data):
    client, _ = client_with_note_data
    update_payload = {"question": "New question?"}

    response = client.patch(
        "/flashcards/00000000-0000-0000-0000-000000000000",
        json=update_payload,
    )

    assert response.status_code == 404

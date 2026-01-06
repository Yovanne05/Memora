"""Tests for GET /notes/{note_id}/flashcards endpoint"""


def test_list_flashcards_returns_empty(client_with_note_data):
    client, data = client_with_note_data
    response = client.get(f"/notes/{data.note_id}/flashcards")

    assert response.status_code == 200
    body = response.get_json()
    assert isinstance(body, dict)
    assert body["items"] == []
    assert body["total"] == 0


def test_list_flashcards_returns_created_flashcards(client_with_note_data):
    client, data = client_with_note_data

    payload1 = {
        "question": "Question 1?",
        "answers": [{"answer_text": "Answer 1", "is_correct": True}],
    }
    payload2 = {
        "question": "Question 2?",
        "answers": [{"answer_text": "Answer 2", "is_correct": True}],
    }

    client.post(f"/notes/{data.note_id}/flashcards", json=payload1)
    client.post(f"/notes/{data.note_id}/flashcards", json=payload2)

    response = client.get(f"/notes/{data.note_id}/flashcards")

    assert response.status_code == 200
    body = response.get_json()
    assert body["total"] == 2
    assert len(body["items"]) == 2
    questions = {item["question"] for item in body["items"]}
    assert questions == {"Question 1?", "Question 2?"}


def test_list_flashcards_for_nonexistent_note_returns_empty(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get(
        "/notes/00000000-0000-0000-0000-000000000000/flashcards"
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["total"] == 0
    assert body["items"] == []

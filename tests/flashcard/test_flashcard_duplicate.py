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
        f"/flashcards/{original_id}/duplicate", json={}
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


def test_duplicate_flashcard_to_another_note(client_with_note_data):
    client, data = client_with_note_data

    note2_payload = {
        "title": "Note 2",
        "content": "Content 2",
        "owner_id": data.owner_id,
        "collection_id": data.collection_id,
    }
    note2_response = client.post("/notes", json=note2_payload)
    note2_id = note2_response.get_json()["id"]
    data.track_created_note(note2_id)

    flashcard_payload = {
        "question": "Question in note 1?",
        "answers": [{"answer_text": "Answer", "is_correct": True}],
    }
    create_response = client.post(
        f"/flashcards/{data.note_id}", json=flashcard_payload
    )
    original_id = create_response.get_json()["id"]

    duplicate_payload = {"target_note_id": note2_id}
    duplicate_response = client.post(
        f"/flashcards/{original_id}/duplicate", json=duplicate_payload
    )

    assert duplicate_response.status_code == 201
    duplicated = duplicate_response.get_json()
    assert duplicated["id"] != original_id
    assert duplicated["note_id"] == note2_id
    assert duplicated["question"] == "Question in note 1?"

    list_note1 = client.get(
        "/flashcards", query_string={"noteId": data.note_id}
    )
    assert list_note1.get_json()["total"] == 1

    list_note2 = client.get("/flashcards", query_string={"noteId": note2_id})
    assert list_note2.get_json()["total"] == 1

    client.delete(f"/notes/{note2_id}")


def test_duplicate_nonexistent_flashcard_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.post(
        "/flashcards/00000000-0000-0000-0000-000000000000/duplicate", json={}
    )

    assert response.status_code == 404


def test_duplicate_flashcard_to_nonexistent_note_returns_404(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Question?",
        "answers": [{"answer_text": "Answer", "is_correct": True}],
    }

    create_response = client.post(
        f"/flashcards/{data.note_id}", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    duplicate_payload = {"target_note_id": "00000000-0000-0000-0000-000000000000"}
    response = client.post(
        f"/flashcards/{flashcard_id}/duplicate", json=duplicate_payload
    )

    assert response.status_code == 404

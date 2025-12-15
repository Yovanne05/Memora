def test_list_flashcards_returns_empty(client_with_note_data):
    client, data = client_with_note_data
    response = client.get(f"/notes/{data.note_id}/flashcards")

    assert response.status_code == 200
    body = response.get_json()
    assert isinstance(body, list)
    assert len(body) == 0


def test_create_flashcard_with_single_answer(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "What is the capital of France?",
        "answers": [{"answer_text": "Paris", "is_correct": True}],
    }

    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

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

    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "What is the keyword for a condition?"
    assert len(body["answers"]) == 3


def test_create_flashcard_without_answers_returns_400(client_with_note_data):
    client, data = client_with_note_data
    payload = {"question": "What is Python?", "answers": []}

    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

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

    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

    assert response.status_code == 400


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

    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "Which of these are programming languages?"
    assert len(body["answers"]) == 3
    correct_count = sum(1 for a in body["answers"] if a["is_correct"])
    assert correct_count == 2


def test_create_flashcard_for_nonexistent_note_returns_404(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Test",
        "answers": [{"answer_text": "Answer", "is_correct": True}],
    }

    response = client.post(
        "/notes/00000000-0000-0000-0000-000000000000/flashcards", json=payload
    )

    assert response.status_code == 404


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
    assert len(body) == 2
    assert body[0]["question"] == "Question 1?"
    assert body[1]["question"] == "Question 2?"


def test_find_one_flashcard_returns_flashcard(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Test question?",
        "answers": [{"answer_text": "Test answer", "is_correct": True}],
    }

    create_response = client.post(
        f"/notes/{data.note_id}/flashcards", json=payload
    )
    flashcard_id = create_response.get_json()["id"]

    response = client.get(f"/notes/flashcards/{flashcard_id}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["id"] == flashcard_id
    assert body["question"] == "Test question?"


def test_find_one_nonexistent_flashcard_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.get("/notes/flashcards/00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404


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
        f"/notes/flashcards/{flashcard_id}", json=update_payload
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
        f"/notes/flashcards/{flashcard_id}", json=update_payload
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
        f"/notes/flashcards/{flashcard_id}", json=update_payload
    )

    assert response.status_code == 422


def test_update_nonexistent_flashcard_returns_404(client_with_note_data):
    client, data = client_with_note_data
    update_payload = {"question": "New question?"}

    response = client.patch(
        "/notes/flashcards/00000000-0000-0000-0000-000000000000",
        json=update_payload,
    )

    assert response.status_code == 404


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

    response = client.delete(f"/notes/flashcards/{flashcard_id}")

    assert response.status_code == 204

    get_response = client.get(f"/notes/flashcards/{flashcard_id}")
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

    client.delete(f"/notes/flashcards/{flashcard_id}")

    response = client.get(f"/notes/{data.note_id}/flashcards")
    assert response.status_code == 200
    assert len(response.get_json()) == 0


def test_delete_nonexistent_flashcard_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(
        "/notes/flashcards/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404


def test_list_flashcards_for_nonexistent_note_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(
        "/notes/00000000-0000-0000-0000-000000000000/flashcards"
    )

    assert response.status_code == 404

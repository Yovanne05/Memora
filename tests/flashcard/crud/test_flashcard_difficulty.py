"""Tests for flashcard difficulty feature"""


def test_create_flashcard_with_difficulty(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Quelle est la capitale de la France?",
        "difficulty": "medium",
        "answers": [
            {"answer_text": "Paris", "is_correct": True},
            {"answer_text": "Lyon", "is_correct": False},
        ],
    }

    response = client.post(f"/flashcards/{data.note_id}", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["difficulty"] == "medium"
    assert body["question"] == "Quelle est la capitale de la France?"


def test_create_flashcard_without_difficulty_defaults_to_none(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "question": "Quelle est la capitale de la France?",
        "answers": [
            {"answer_text": "Paris", "is_correct": True},
            {"answer_text": "Lyon", "is_correct": False},
        ],
    }

    response = client.post(f"/flashcards/{data.note_id}", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["difficulty"] is None


def test_create_flashcard_with_all_difficulty_levels(client_with_note_data):
    client, data = client_with_note_data
    difficulties = ["easy", "medium", "hard"]

    for difficulty in difficulties:
        payload = {
            "question": f"Question {difficulty}",
            "difficulty": difficulty,
            "answers": [
                {"answer_text": "Correct", "is_correct": True},
            ],
        }

        response = client.post(f"/flashcards/{data.note_id}", json=payload)

        assert response.status_code == 201
        body = response.get_json()
        assert body["difficulty"] == difficulty


def test_update_flashcard_difficulty(client_with_note_data):
    client, data = client_with_note_data

    create_payload = {
        "question": "Test question",
        "answers": [
            {"answer_text": "Answer", "is_correct": True},
        ],
    }

    create_response = client.post(f"/flashcards/{data.note_id}", json=create_payload)
    flashcard_id = create_response.get_json()["id"]

    update_payload = {"difficulty": "hard"}

    response = client.patch(f"/flashcards/{flashcard_id}", json=update_payload)

    assert response.status_code == 200
    body = response.get_json()
    assert body["difficulty"] == "hard"


def test_get_flashcard_returns_difficulty(client_with_note_data):
    client, data = client_with_note_data

    create_payload = {
        "question": "Question",
        "difficulty": "easy",
        "answers": [
            {"answer_text": "Correct", "is_correct": True},
        ],
    }

    create_response = client.post(f"/flashcards/{data.note_id}", json=create_payload)
    flashcard_id = create_response.get_json()["id"]

    response = client.get(f"/flashcards/{flashcard_id}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["difficulty"] == "easy"


def test_list_flashcards_returns_difficulty(client_with_note_data):
    client, data = client_with_note_data

    payload1 = {
        "question": "Question 1",
        "difficulty": "easy",
        "answers": [
            {"answer_text": "Correct", "is_correct": True},
        ],
    }

    payload2 = {
        "question": "Question 2",
        "difficulty": "hard",
        "answers": [
            {"answer_text": "Correct", "is_correct": True},
        ],
    }

    client.post(f"/flashcards/{data.note_id}", json=payload1)
    client.post(f"/flashcards/{data.note_id}", json=payload2)

    response = client.get("/flashcards", query_string={"noteId": data.note_id})

    assert response.status_code == 200
    body = response.get_json()
    assert len(body["items"]) == 2
    assert body["items"][0]["difficulty"] in ["easy", "hard"]
    assert body["items"][1]["difficulty"] in ["easy", "hard"]


def test_duplicate_flashcard_preserves_difficulty(client_with_note_data):
    client, data = client_with_note_data

    create_payload = {
        "question": "Original question",
        "difficulty": "medium",
        "answers": [
            {"answer_text": "Correct", "is_correct": True},
        ],
    }

    create_response = client.post(f"/flashcards/{data.note_id}", json=create_payload)
    original_flashcard_id = create_response.get_json()["id"]

    duplicate_response = client.post(f"/flashcards/{original_flashcard_id}/duplicate")

    assert duplicate_response.status_code == 201
    duplicated = duplicate_response.get_json()
    assert duplicated["difficulty"] == "medium"
    assert duplicated["question"] == "Original question"
    assert duplicated["id"] != original_flashcard_id

"""Tests for POST /reviews endpoint"""


def test_create_review_with_correct_answer_good_difficulty(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 201
    body = response.get_json()

    assert body["flashcard_id"] == flashcard_id
    assert body["selected_answer_id"] == correct_answer_id
    assert body["is_correct"] is True
    assert body["difficulty"] == "good"
    assert float(body["e_factor"]) == 2.5
    assert body["repetitions"] == 1
    assert body["interval_days"] == 1
    assert "next_review_at" in body
    assert "reviewed_at" in body


def test_create_review_with_correct_answer_easy_difficulty(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "easy",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 201
    body = response.get_json()

    assert body["is_correct"] is True
    assert body["difficulty"] == "easy"
    assert float(body["e_factor"]) >= 2.5


def test_create_review_with_correct_answer_hard_difficulty(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "hard",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 201
    body = response.get_json()

    assert body["is_correct"] is True
    assert body["difficulty"] == "hard"
    assert float(body["e_factor"]) >= 1.3


def test_create_review_with_incorrect_answer_again_difficulty(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    incorrect_answer_id = data.get_incorrect_answer_id(flashcard_id)

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": incorrect_answer_id,
        "difficulty": "again",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 201
    body = response.get_json()

    assert body["is_correct"] is False
    assert body["difficulty"] == "again"
    assert body["repetitions"] == 0
    assert body["interval_days"] == 1


def test_update_existing_review(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload1 = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    response1 = client.post("/reviews", json=payload1)
    assert response1.status_code == 201
    body1 = response1.get_json()
    first_repetitions = body1["repetitions"]

    payload2 = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    response2 = client.post("/reviews", json=payload2)
    assert response2.status_code == 201
    body2 = response2.get_json()

    assert body2["repetitions"] > first_repetitions
    assert body2["interval_days"] == 6


def test_create_review_for_nonexistent_flashcard_returns_404(client_with_review_data):
    client, data = client_with_review_data

    payload = {
        "flashcardId": "00000000-0000-0000-0000-000000000000",
        "selectedAnswerId": "00000000-0000-0000-0000-000000000001",
        "difficulty": "good",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 404


def test_create_review_with_invalid_answer_returns_400(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    other_flashcard_id = data.flashcard_ids[1]
    wrong_answer_id = data.correct_answer_ids[other_flashcard_id]

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": wrong_answer_id,
        "difficulty": "good",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 400


def test_create_review_with_invalid_difficulty_returns_422(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "super_easy",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 422


def test_create_review_missing_fields_returns_422(client_with_review_data):
    client, _ = client_with_review_data

    payload = {
        "flashcardId": "00000000-0000-0000-0000-000000000000",
        "selectedAnswerId": "00000000-0000-0000-0000-000000000001",
    }

    response = client.post("/reviews", json=payload)

    assert response.status_code == 422


def test_multiple_flashcards_different_reviews(client_with_review_data):
    client, data = client_with_review_data

    flashcard1_id = data.flashcard_ids[0]
    flashcard1_answer = data.correct_answer_ids[flashcard1_id]

    payload1 = {
        "flashcardId": flashcard1_id,
        "selectedAnswerId": flashcard1_answer,
        "difficulty": "easy",
    }
    response1 = client.post("/reviews", json=payload1)
    assert response1.status_code == 201

    flashcard2_id = data.flashcard_ids[1]
    flashcard2_answer = data.correct_answer_ids[flashcard2_id]

    payload2 = {
        "flashcardId": flashcard2_id,
        "selectedAnswerId": flashcard2_answer,
        "difficulty": "hard",
    }
    response2 = client.post("/reviews", json=payload2)
    assert response2.status_code == 201

    body1 = response1.get_json()
    body2 = response2.get_json()

    assert body1["flashcard_id"] != body2["flashcard_id"]
    assert body1["difficulty"] == "easy"
    assert body2["difficulty"] == "hard"

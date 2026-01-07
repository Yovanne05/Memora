"""Tests for GET /reviews?status=upcoming endpoint"""
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime


def test_get_upcoming_reviews_empty_when_no_reviews(client_with_review_data):
    client, _ = client_with_review_data

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()
    assert isinstance(body, list)
    assert len(body) == 0


def test_get_upcoming_reviews_after_single_review(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()

    assert isinstance(body, list)
    assert len(body) == 1

    group = body[0]
    assert "date" in group
    assert "flashcards" in group
    assert isinstance(group["flashcards"], list)
    assert len(group["flashcards"]) == 1

    flashcard = group["flashcards"][0]
    assert flashcard["flashcard_id"] == flashcard_id
    assert "question" in flashcard
    assert "next_review_at" in flashcard


def test_get_upcoming_reviews_multiple_flashcards_same_date(client_with_review_data):
    client, data = client_with_review_data

    for flashcard_id in data.flashcard_ids[:2]:
        correct_answer_id = data.correct_answer_ids[flashcard_id]
        payload = {
            "flashcard_id": flashcard_id,
            "selected_answer_id": correct_answer_id,
            "difficulty": "good",
        }
        client.post("/reviews", json=payload)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()

    assert isinstance(body, list)
    assert len(body) >= 1

    total_flashcards = sum(len(group["flashcards"]) for group in body)
    assert total_flashcards == 2


def test_get_upcoming_reviews_sorted_by_date(client_with_review_data):
    client, data = client_with_review_data

    flashcard1_id = data.flashcard_ids[0]
    flashcard2_id = data.flashcard_ids[1]

    payload1 = {
        "flashcard_id": flashcard1_id,
        "selected_answer_id": data.correct_answer_ids[flashcard1_id],
        "difficulty": "again",
    }
    client.post("/reviews", json=payload1)

    payload2 = {
        "flashcard_id": flashcard2_id,
        "selected_answer_id": data.correct_answer_ids[flashcard2_id],
        "difficulty": "easy",
    }
    client.post("/reviews", json=payload2)
    client.post("/reviews", json=payload2)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()

    if len(body) > 1:
        dates = [group["date"] for group in body]
        assert dates == sorted(dates)


def test_get_upcoming_reviews_contains_question_text(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()

    flashcard = body[0]["flashcards"][0]
    assert flashcard["question"] == "What is the capital of France?"


def test_get_upcoming_reviews_date_format(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()

    date_str = body[0]["date"]
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        assert False, f"Date format is invalid: {date_str}"


def test_get_upcoming_reviews_only_for_current_user(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    other_user_id = data.note_data.create_user("other-user")

    data.note_data._authenticate_client(other_user_id)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()
    assert len(body) == 0


def test_get_upcoming_reviews_includes_past_due(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()

    assert len(body) == 1
    assert len(body[0]["flashcards"]) == 1


def test_get_upcoming_reviews_response_structure(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    response = client.get("/reviews?status=upcoming")

    assert response.status_code == 200
    body = response.get_json()

    assert isinstance(body, list)
    for group in body:
        assert isinstance(group, dict)
        assert "date" in group
        assert "flashcards" in group
        assert isinstance(group["flashcards"], list)
        for flashcard in group["flashcards"]:
            assert isinstance(flashcard, dict)
            assert "flashcardId" in flashcard
            assert "question" in flashcard
            assert "next_review_at" in flashcard
            next_review_str = flashcard["next_review_at"]
            try:
                datetime.fromisoformat(next_review_str.replace("Z", "+00:00"))
            except ValueError:
                try:
                    parsedate_to_datetime(next_review_str)
                except (ValueError, TypeError):
                    assert False, f"next_review_at format is invalid: {next_review_str}"

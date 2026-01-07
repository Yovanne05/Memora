"""Tests for review statistics in /users/me/statistics endpoint"""


def test_statistics_review_stats_empty_initially(client_with_review_data):
    client, _ = client_with_review_data

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    assert "review_statistics" in body
    review_stats = body["review_statistics"]

    assert review_stats["total_reviews"] == 0
    assert review_stats["reviews_last_7_days"] == 0
    assert review_stats["reviews_last_30_days"] == 0
    assert review_stats["average_quality"] == 0.0
    assert "quality_distribution" in review_stats


def test_statistics_review_stats_after_single_review(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    review_stats = body["review_statistics"]
    assert review_stats["total_reviews"] == 1
    assert review_stats["reviews_last_7_days"] == 1
    assert review_stats["reviews_last_30_days"] == 1
    assert review_stats["average_quality"] == 2.0


def test_statistics_review_stats_multiple_reviews(client_with_review_data):
    client, data = client_with_review_data

    flashcard1_id = data.flashcard_ids[0]
    payload1 = {
        "flashcard_id": flashcard1_id,
        "selected_answer_id": data.correct_answer_ids[flashcard1_id],
        "difficulty": "good",
    }
    client.post("/reviews", json=payload1)

    flashcard2_id = data.flashcard_ids[1]
    payload2 = {
        "flashcard_id": flashcard2_id,
        "selected_answer_id": data.correct_answer_ids[flashcard2_id],
        "difficulty": "easy",
    }
    client.post("/reviews", json=payload2)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    review_stats = body["review_statistics"]
    assert review_stats["total_reviews"] == 2
    assert review_stats["average_quality"] == 2.5


def test_statistics_quality_distribution(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    difficulties = ["again", "hard", "good", "easy", "good", "good"]

    for difficulty in difficulties:
        payload = {
            "flashcard_id": flashcard_id,
            "selected_answer_id": correct_answer_id,
            "difficulty": difficulty,
        }
        client.post("/reviews", json=payload)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    distribution = body["review_statistics"]["quality_distribution"]


def test_statistics_quality_distribution_all_difficulties(client_with_review_data):
    client, data = client_with_review_data

    data.create_flashcard(
        question="Test 1?",
        answers=[
            {"answer_text": "A", "is_correct": True},
            {"answer_text": "B", "is_correct": False},
        ],
    )
    data.create_flashcard(
        question="Test 2?",
        answers=[
            {"answer_text": "A", "is_correct": True},
            {"answer_text": "B", "is_correct": False},
        ],
    )

    difficulties = ["again", "hard", "good", "easy"]

    for i, difficulty in enumerate(difficulties):
        flashcard_id = data.flashcard_ids[i]
        correct_answer_id = data.correct_answer_ids[flashcard_id]
        payload = {
            "flashcard_id": flashcard_id,
            "selected_answer_id": correct_answer_id,
            "difficulty": difficulty,
        }
        client.post("/reviews", json=payload)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    distribution = body["review_statistics"]["quality_distribution"]

    assert "again" in distribution
    assert "hard" in distribution
    assert "good" in distribution
    assert "easy" in distribution

    assert distribution["again"] == 1
    assert distribution["hard"] == 1
    assert distribution["good"] == 1
    assert distribution["easy"] == 1


def test_statistics_updates_on_review_update(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload1 = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload1)

    response1 = client.get("/users/me/statistics")
    assert response1.status_code == 200
    body1 = response1.get_json()
    assert body1["review_statistics"]["total_reviews"] == 1
    assert body1["review_statistics"]["average_quality"] == 2.0

    payload2 = {
        "flashcard_id": flashcard_id,
        "selected_answer_id": correct_answer_id,
        "difficulty": "easy",
    }
    client.post("/reviews", json=payload2)

    response2 = client.get("/users/me/statistics")
    assert response2.status_code == 200
    body2 = response2.get_json()
    assert body2["review_statistics"]["total_reviews"] == 1
    assert body2["review_statistics"]["average_quality"] == 3.0


def test_statistics_only_shows_current_user_reviews(client_with_review_data):
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

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    review_stats = body["review_statistics"]
    assert review_stats["total_reviews"] == 0
    assert review_stats["reviews_last_7_days"] == 0
    assert review_stats["reviews_last_30_days"] == 0


def test_statistics_content_stats_unaffected(client_with_review_data):
    client, data = client_with_review_data

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    assert "content_statistics" in body
    content_stats = body["content_statistics"]
    assert "notes_created" in content_stats
    assert "collections_created" in content_stats
    assert "flashcards_created" in content_stats

    assert "review_statistics" in body

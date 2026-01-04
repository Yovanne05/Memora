"""Tests for review statistics in /users/me/statistics endpoint"""


def test_statistics_review_stats_empty_initially(client_with_review_data):
    client, _ = client_with_review_data

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    assert "reviewStatistics" in body
    review_stats = body["reviewStatistics"]

    assert review_stats["totalReviews"] == 0
    assert review_stats["reviewsLast7Days"] == 0
    assert review_stats["reviewsLast30Days"] == 0
    assert review_stats["averageQuality"] == 0.0
    assert "qualityDistribution" in review_stats


def test_statistics_review_stats_after_single_review(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    review_stats = body["reviewStatistics"]
    assert review_stats["totalReviews"] == 1
    assert review_stats["reviewsLast7Days"] == 1
    assert review_stats["reviewsLast30Days"] == 1
    assert review_stats["averageQuality"] == 2.0


def test_statistics_review_stats_multiple_reviews(client_with_review_data):
    client, data = client_with_review_data

    flashcard1_id = data.flashcard_ids[0]
    payload1 = {
        "flashcardId": flashcard1_id,
        "selectedAnswerId": data.correct_answer_ids[flashcard1_id],
        "difficulty": "good",
    }
    client.post("/reviews", json=payload1)

    flashcard2_id = data.flashcard_ids[1]
    payload2 = {
        "flashcardId": flashcard2_id,
        "selectedAnswerId": data.correct_answer_ids[flashcard2_id],
        "difficulty": "easy",
    }
    client.post("/reviews", json=payload2)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    review_stats = body["reviewStatistics"]
    assert review_stats["totalReviews"] == 2
    assert review_stats["averageQuality"] == 2.5


def test_statistics_quality_distribution(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    difficulties = ["again", "hard", "good", "easy", "good", "good"]

    for difficulty in difficulties:
        payload = {
            "flashcardId": flashcard_id,
            "selectedAnswerId": correct_answer_id,
            "difficulty": difficulty,
        }
        client.post("/reviews", json=payload)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    distribution = body["reviewStatistics"]["qualityDistribution"]


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
            "flashcardId": flashcard_id,
            "selectedAnswerId": correct_answer_id,
            "difficulty": difficulty,
        }
        client.post("/reviews", json=payload)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    distribution = body["reviewStatistics"]["qualityDistribution"]

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
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload1)

    response1 = client.get("/users/me/statistics")
    assert response1.status_code == 200
    body1 = response1.get_json()
    assert body1["reviewStatistics"]["totalReviews"] == 1
    assert body1["reviewStatistics"]["averageQuality"] == 2.0

    payload2 = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "easy",
    }
    client.post("/reviews", json=payload2)

    response2 = client.get("/users/me/statistics")
    assert response2.status_code == 200
    body2 = response2.get_json()
    assert body2["reviewStatistics"]["totalReviews"] == 1
    assert body2["reviewStatistics"]["averageQuality"] == 3.0


def test_statistics_only_shows_current_user_reviews(client_with_review_data):
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    other_user_id = data.note_data.create_user("other-user")

    data.note_data._authenticate_client(other_user_id)

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    review_stats = body["reviewStatistics"]
    assert review_stats["totalReviews"] == 0
    assert review_stats["reviewsLast7Days"] == 0
    assert review_stats["reviewsLast30Days"] == 0


def test_statistics_content_stats_unaffected(client_with_review_data):
    client, data = client_with_review_data

    response = client.get("/users/me/statistics")

    assert response.status_code == 200
    body = response.get_json()

    assert "contentStatistics" in body
    content_stats = body["contentStatistics"]
    assert "notesCreated" in content_stats
    assert "collectionsCreated" in content_stats
    assert "flashcardsCreated" in content_stats

    assert "reviewStatistics" in body

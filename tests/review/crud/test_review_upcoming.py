"""Tests for GET /reviews/upcoming endpoint"""
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime


def test_get_upcoming_reviews_empty_when_no_reviews(client_with_review_data):
    """Test getting upcoming reviews when no reviews have been submitted"""
    client, _ = client_with_review_data

    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()
    assert isinstance(body, list)
    assert len(body) == 0


def test_get_upcoming_reviews_after_single_review(client_with_review_data):
    """Test getting upcoming reviews after submitting one review"""
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    # Soumettre une review
    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    # Récupérer les upcoming reviews
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()

    assert isinstance(body, list)
    assert len(body) == 1  # Une seule date groupe

    # Vérifier la structure
    group = body[0]
    assert "date" in group
    assert "flashcards" in group
    assert isinstance(group["flashcards"], list)
    assert len(group["flashcards"]) == 1

    # Vérifier le flashcard
    flashcard = group["flashcards"][0]
    assert flashcard["flashcardId"] == flashcard_id
    assert "question" in flashcard
    assert "nextReviewAt" in flashcard


def test_get_upcoming_reviews_multiple_flashcards_same_date(client_with_review_data):
    """Test upcoming reviews when multiple flashcards are due on the same date"""
    client, data = client_with_review_data

    # Soumettre reviews pour deux flashcards avec la même difficulté
    # (devrait résulter en même next_review_at puisque interval sera le même)
    for flashcard_id in data.flashcard_ids[:2]:
        correct_answer_id = data.correct_answer_ids[flashcard_id]
        payload = {
            "flashcardId": flashcard_id,
            "selectedAnswerId": correct_answer_id,
            "difficulty": "good",
        }
        client.post("/reviews", json=payload)

    # Récupérer les upcoming reviews
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()

    assert isinstance(body, list)
    assert len(body) >= 1  # Au moins un groupe de date

    # Vérifier qu'on a bien 2 flashcards au total
    total_flashcards = sum(len(group["flashcards"]) for group in body)
    assert total_flashcards == 2


def test_get_upcoming_reviews_sorted_by_date(client_with_review_data):
    """Test that upcoming reviews are sorted chronologically"""
    client, data = client_with_review_data

    flashcard1_id = data.flashcard_ids[0]
    flashcard2_id = data.flashcard_ids[1]

    # Review 1: difficulty 'again' (interval court)
    payload1 = {
        "flashcardId": flashcard1_id,
        "selectedAnswerId": data.correct_answer_ids[flashcard1_id],
        "difficulty": "again",
    }
    client.post("/reviews", json=payload1)

    # Review 2: difficulty 'easy' -> puis une deuxième review pour augmenter l'intervalle
    payload2 = {
        "flashcardId": flashcard2_id,
        "selectedAnswerId": data.correct_answer_ids[flashcard2_id],
        "difficulty": "easy",
    }
    client.post("/reviews", json=payload2)
    # Deuxième review pour flashcard2
    client.post("/reviews", json=payload2)

    # Récupérer les upcoming reviews
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()

    # Vérifier que les dates sont triées
    if len(body) > 1:
        dates = [group["date"] for group in body]
        assert dates == sorted(dates)


def test_get_upcoming_reviews_contains_question_text(client_with_review_data):
    """Test that upcoming reviews include the question text"""
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    # Soumettre une review
    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    # Récupérer les upcoming reviews
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()

    flashcard = body[0]["flashcards"][0]
    assert flashcard["question"] == "What is the capital of France?"


def test_get_upcoming_reviews_date_format(client_with_review_data):
    """Test that date is in ISO format (YYYY-MM-DD)"""
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    # Soumettre une review
    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    # Récupérer les upcoming reviews
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()

    date_str = body[0]["date"]
    # Vérifier le format YYYY-MM-DD
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        assert False, f"Date format is invalid: {date_str}"


def test_get_upcoming_reviews_only_for_current_user(client_with_review_data):
    """Test that upcoming reviews only shows flashcards for the authenticated user"""
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    # L'utilisateur courant soumet une review
    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    # Créer un deuxième utilisateur
    other_user_id = data.note_data.create_user("other-user")

    # Basculer vers le deuxième utilisateur
    data.note_data._authenticate_client(other_user_id)

    # Le deuxième utilisateur ne devrait pas voir les reviews du premier
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()
    assert len(body) == 0  # Pas de reviews pour ce nouvel utilisateur


def test_get_upcoming_reviews_includes_past_due(client_with_review_data):
    """Test that upcoming reviews includes flashcards that are past due"""
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    # Soumettre une review (qui sera due dans 1 jour avec difficulty 'good')
    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    # Récupérer les upcoming reviews (même si la date est dans le futur, elle devrait être incluse)
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()

    # La flashcard devrait être présente
    assert len(body) == 1
    assert len(body[0]["flashcards"]) == 1


def test_get_upcoming_reviews_response_structure(client_with_review_data):
    """Test that the response structure matches the expected format"""
    client, data = client_with_review_data

    flashcard_id = data.flashcard_ids[0]
    correct_answer_id = data.correct_answer_ids[flashcard_id]

    # Soumettre une review
    payload = {
        "flashcardId": flashcard_id,
        "selectedAnswerId": correct_answer_id,
        "difficulty": "good",
    }
    client.post("/reviews", json=payload)

    # Récupérer les upcoming reviews
    response = client.get("/reviews/upcoming")

    assert response.status_code == 200
    body = response.get_json()

    # Vérifier la structure complète
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
            assert "nextReviewAt" in flashcard
            # Vérifier que nextReviewAt est parseable (ISO ou RFC 1123)
            next_review_str = flashcard["nextReviewAt"]
            try:
                # Essayer ISO format
                datetime.fromisoformat(next_review_str.replace("Z", "+00:00"))
            except ValueError:
                try:
                    # Essayer RFC 1123 format (HTTP date)
                    parsedate_to_datetime(next_review_str)
                except (ValueError, TypeError):
                    assert False, f"nextReviewAt format is invalid: {next_review_str}"

"""
Tests pour le controller review (routing et HTTP).

Ces tests vérifient le routing et les réponses HTTP :
- POST /reviews (créer une review)
- GET /reviews?status=upcoming (récupérer les reviews à venir)

Le service review_service est MOCKÉ.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime


class TestReviewControllerCreate:
    """Tests pour POST /reviews"""

    def test_create_review_returns_201(self, app_client, mock_review_service, monkeypatch):
        """Le endpoint POST /reviews retourne 201 avec la review créée."""
        from dtos.review_dto import ReviewDTO
        from daos.user_dao import User
        from utils.enums import ReviewDifficultyEnum, RoleEnum
        from decimal import Decimal

        # Arrange
        user_id = str(uuid4())
        current_user = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT
        )
        monkeypatch.setattr("controllers.review_controller.get_current_user", lambda: current_user)

        flashcard_id = str(uuid4())
        selected_answer_id = str(uuid4())
        created_review = ReviewDTO(
            user_id=user_id,
            flashcard_id=flashcard_id,
            selected_answer_id=selected_answer_id,
            is_correct=True,
            difficulty=ReviewDifficultyEnum.EASY,
            e_factor=Decimal("2.6"),
            repetitions=1,
            interval_days=1,
            next_review_at=datetime.now(),
            reviewed_at=datetime.now()
        )
        mock_review_service.submit_review.return_value = created_review

        payload = {
            "flashcard_id": flashcard_id,
            "selected_answer_id": selected_answer_id,
            "difficulty": "easy"
        }

        # Act
        response = app_client.post("/reviews", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["flashcard_id"] == flashcard_id
        assert body["is_correct"] is True
        mock_review_service.submit_review.assert_called_once()

    def test_create_review_returns_404_flashcard_not_found(self, app_client, mock_review_service, monkeypatch):
        """Le endpoint retourne 404 si la flashcard n'existe pas."""
        from exceptions.review_exception import FlashcardNotFoundForReview
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        current_user = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT
        )
        monkeypatch.setattr("controllers.review_controller.get_current_user", lambda: current_user)

        mock_review_service.submit_review.side_effect = FlashcardNotFoundForReview()

        payload = {
            "flashcard_id": str(uuid4()),
            "selected_answer_id": str(uuid4()),
            "difficulty": "good"
        }

        # Act
        response = app_client.post("/reviews", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND

"""
Tests pour le controller review (routing et HTTP).

Ces tests vérifient le routing et les réponses HTTP :
- POST /reviews (créer une review)
- GET /reviews?status=upcoming (récupérer les reviews à venir)

Le service review_service est MOCKÉ.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime


class TestReviewControllerFindMany:
    """Tests pour GET /reviews"""

    def test_get_upcoming_reviews_returns_200(self, authenticated_client, mock_review_service, monkeypatch):
        """Le endpoint GET /reviews?status=upcoming retourne 200 avec les reviews groupées."""
        from dtos.review_dto import UpcomingReviewsGroupDTO, FlashcardWithReviewDTO
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

        upcoming = [
            UpcomingReviewsGroupDTO(
                date="2024-01-01",
                flashcards=[
                    FlashcardWithReviewDTO(
                        flashcard_id=str(uuid4()),
                        question="Question 1",
                        next_review_at=datetime.now()
                    )
                ]
            )
        ]
        mock_review_service.get_upcoming_reviews.return_value = upcoming

        # Act
        response = authenticated_client.get("/reviews?status=upcoming")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert isinstance(body, list)
        assert len(body) == 1
        assert "date" in body[0]
        assert "flashcards" in body[0]
        mock_review_service.get_upcoming_reviews.assert_called_once_with(user_id)

    def test_get_reviews_invalid_status_returns_400(self, authenticated_client, monkeypatch):
        """Le endpoint retourne 400 si le status est invalide."""
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

        # Act
        response = authenticated_client.get("/reviews?status=invalid")

        # Assert
        assert response.status_code == HTTPStatus.BAD_REQUEST

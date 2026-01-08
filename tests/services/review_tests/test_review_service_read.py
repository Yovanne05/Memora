"""
Tests pour le service review (logique métier).

Ces tests vérifient la logique métier :
- Soumettre une review avec algorithme SM-2
- Récupérer les reviews à venir groupées par date
- Validation flashcard et answer

Les repositories sont MOCKÉS.
"""
import pytest
from uuid import uuid4
from unittest.mock import Mock
from decimal import Decimal
from datetime import datetime, timezone
from dtos.review_dto import ReviewDTO
from daos.review_dao import Review
from exceptions.review_exception import FlashcardNotFoundForReview, InvalidAnswerForFlashcard
from utils.enums import ReviewDifficultyEnum


class TestReviewServiceGetUpcoming:
    """Tests pour récupérer les reviews à venir"""

    def test_get_upcoming_reviews_success(self, mock_review_repository):
        """Récupérer les reviews groupées par date."""
        from services.impl.review_service_impl import review_service

        # Arrange
        user_id = str(uuid4())
        mock_review_repository.get_upcoming_reviews.return_value = {
            "2024-01-01": [(str(uuid4()), "Question 1", "2024-01-01T10:00:00Z")],
            "2024-01-02": [(str(uuid4()), "Question 2", "2024-01-02T10:00:00Z")]
        }

        # Act
        result = review_service.get_upcoming_reviews(user_id)

        # Assert
        assert len(result) == 2
        assert result[0].date == "2024-01-01"
        assert len(result[0].flashcards) == 1
        mock_review_repository.get_upcoming_reviews.assert_called_once_with(user_id)

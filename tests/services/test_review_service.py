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


class TestReviewServiceSubmit:
    """Tests pour soumettre une review"""

    def test_submit_review_success(self, mock_flashcard_repository, mock_review_repository, monkeypatch):
        """Soumettre une review met à jour l'algorithme SM-2."""
        from services.impl.review_service_impl import review_service
        from daos.flashcard_dao import Flashcard
        from daos.flashcard_answer_dao import FlashcardAnswer

        # Arrange
        user_id = str(uuid4())
        flashcard_id = str(uuid4())
        answer_id = str(uuid4())

        flashcard = Flashcard(
            id=flashcard_id,
            question="Question?",
            note_id=str(uuid4()),
            answers=[
                FlashcardAnswer(id=answer_id, flashcard_id=flashcard_id, answer_text="Answer", is_correct=True, created_at=datetime.now())
            ],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_flashcard_repository.find_one_unscoped.return_value = flashcard
        mock_review_repository.get_review.return_value = None

        saved_review = Review(
            id=str(uuid4()),
            user_id=user_id,
            flashcard_id=flashcard_id,
            selected_answer_id=answer_id,
            is_correct=True,
            difficulty=ReviewDifficultyEnum.EASY,
            e_factor=Decimal("2.6"),
            repetitions=1,
            interval_days=1,
            next_review_at=datetime.now(timezone.utc),
            reviewed_at=datetime.now(timezone.utc),
            created_at=datetime.now()
        )
        mock_review_repository.upsert_review.return_value = saved_review

        # Act
        result = review_service.submit_review(user_id, flashcard_id, answer_id, "easy")

        # Assert
        assert isinstance(result, ReviewDTO)
        assert result.is_correct is True
        mock_flashcard_repository.find_one_unscoped.assert_called_once_with(flashcard_id)
        mock_review_repository.upsert_review.assert_called_once()

    def test_submit_review_flashcard_not_found(self, mock_flashcard_repository):
        """Soumettre une review avec flashcard inexistante lève FlashcardNotFoundForReview."""
        from services.impl.review_service_impl import review_service

        # Arrange
        mock_flashcard_repository.find_one_unscoped.return_value = None

        # Act & Assert
        with pytest.raises(FlashcardNotFoundForReview):
            review_service.submit_review(str(uuid4()), str(uuid4()), str(uuid4()), "medium")

    def test_submit_review_invalid_answer(self, mock_flashcard_repository):
        """Soumettre une review avec un answer_id invalide lève InvalidAnswerForFlashcard."""
        from services.impl.review_service_impl import review_service
        from daos.flashcard_dao import Flashcard
        from daos.flashcard_answer_dao import FlashcardAnswer

        # Arrange
        flashcard_id = str(uuid4())
        flashcard = Flashcard(
            id=flashcard_id,
            question="Q?",
            note_id=str(uuid4()),
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=flashcard_id, answer_text="A", is_correct=True, created_at=datetime.now())],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_flashcard_repository.find_one_unscoped.return_value = flashcard

        # Act & Assert
        with pytest.raises(InvalidAnswerForFlashcard):
            review_service.submit_review(str(uuid4()), flashcard.id, str(uuid4()), "hard")


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

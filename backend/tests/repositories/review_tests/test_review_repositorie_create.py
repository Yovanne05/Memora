"""
Tests pour l'upsert de review (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from daos.review_dao import Review
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from repositorys import review_repository, flashcard_repository
from utils.enums import ReviewDifficultyEnum


class TestReviewRepositoryUpsert:
    """Tests pour l'upsert de review"""

    def test_upsert_review_insert(self, test_factory):
        """Insérer une nouvelle review."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        flashcard_id = str(uuid4())
        flashcard = Flashcard(
            id=flashcard_id,
            question="Question?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=flashcard_id, answer_text="Answer", is_correct=True, created_at=datetime.now())]
        )
        flashcard_repository.add(flashcard)

        review = Review(
            user_id=user_id,
            flashcard_id=flashcard.id,
            selected_answer_id=flashcard.answers[0].id,
            is_correct=True,
            difficulty=ReviewDifficultyEnum.EASY,
            e_factor=Decimal("2.6"),
            repetitions=1,
            interval_days=1,
            next_review_at=datetime.now(timezone.utc) + timedelta(days=1),
            reviewed_at=datetime.now(timezone.utc)
        )

        # Act
        result = review_repository.upsert_review(review)

        # Assert
        # Composite key: (user_id, flashcard_id)
        assert result.user_id == user_id
        assert result.flashcard_id == flashcard.id

    def test_upsert_review_update(self, test_factory):
        """Mettre à jour une review existante."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        flashcard_id = str(uuid4())
        flashcard = Flashcard(
            id=flashcard_id,
            question="Q?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=flashcard_id, answer_text="A", is_correct=True, created_at=datetime.now())]
        )
        flashcard_repository.add(flashcard)

        # Première review
        review1 = Review(
            user_id=user_id,
            flashcard_id=flashcard.id,
            selected_answer_id=flashcard.answers[0].id,
            is_correct=True,
            difficulty=ReviewDifficultyEnum.EASY,
            e_factor=Decimal("2.5"),
            repetitions=0,
            interval_days=0,
            next_review_at=datetime.now(timezone.utc),
            reviewed_at=datetime.now(timezone.utc)
        )
        review_repository.upsert_review(review1)

        # Deuxième review (update)
        review2 = Review(
            user_id=user_id,
            flashcard_id=flashcard.id,
            selected_answer_id=flashcard.answers[0].id,
            is_correct=True,
            difficulty=ReviewDifficultyEnum.GOOD,
            e_factor=Decimal("2.6"),
            repetitions=1,
            interval_days=1,
            next_review_at=datetime.now(timezone.utc) + timedelta(days=1),
            reviewed_at=datetime.now(timezone.utc)
        )

        # Act
        result = review_repository.upsert_review(review2)

        # Assert
        assert result.repetitions == 1
        assert result.e_factor == Decimal("2.6")

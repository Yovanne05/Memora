"""
Tests pour le repository review (accès base de données).

Ces tests vérifient les requêtes SQL :
- Upsert review (insert ou update)
- Récupérer review par user/flashcard
- Récupérer reviews à venir groupées

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from datetime import datetime, timezone
from decimal import Decimal
from daos.review_dao import Review
from repositorys import review_repository
from utils.enums import ReviewDifficultyEnum


class TestReviewRepositoryGet:
    """Tests pour récupérer une review"""

    def test_get_review_success(self, test_factory):
        """Récupérer une review existante."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        from daos.flashcard_dao import Flashcard
        from daos.flashcard_answer_dao import FlashcardAnswer
        from repositorys import flashcard_repository

        flashcard_id = str(uuid4())
        flashcard = Flashcard(
            id=flashcard_id,
            question="Q?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=flashcard_id, answer_text="A", is_correct=True, created_at=datetime.now())]
        )
        flashcard_repository.add(flashcard)

        review = Review(
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
        review_repository.upsert_review(review)

        # Act
        result = review_repository.get_review(user_id, flashcard.id)

        # Assert
        assert result is not None
        assert result.user_id == user_id
        assert result.flashcard_id == flashcard.id

    def test_get_review_not_found(self):
        """Récupérer une review inexistante retourne None."""
        # Act
        result = review_repository.get_review(str(uuid4()), str(uuid4()))

        # Assert
        assert result is None

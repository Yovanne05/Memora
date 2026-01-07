"""
Tests pour le repository review (accès base de données).

Ces tests vérifient les requêtes SQL :
- Upsert review (insert ou update)
- Récupérer review par user/flashcard
- Récupérer reviews à venir groupées

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from daos.review_dao import Review
from repositorys import review_repository
from utils.enums import ReviewDifficultyEnum


class TestReviewRepositoryUpsert:
    """Tests pour l'upsert de review"""

    def test_upsert_review_insert(self, test_factory):
        """Insérer une nouvelle review."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        # Créer flashcard manuellement car test_factory n'a pas create_flashcard
        from daos.flashcard_dao import Flashcard, Answer
        from repositorys import flashcard_repository

        flashcard = Flashcard(
            id=str(uuid4()),
            question="Question?",
            note_id=note_id,
            answers=[Answer(id=str(uuid4()), text="Answer", is_correct=True)]
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
        assert result.id is not None
        assert result.user_id == user_id
        assert result.flashcard_id == flashcard.id

    def test_upsert_review_update(self, test_factory):
        """Mettre à jour une review existante."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        from daos.flashcard_dao import Flashcard, Answer
        from repositorys import flashcard_repository

        flashcard = Flashcard(
            id=str(uuid4()),
            question="Q?",
            note_id=note_id,
            answers=[Answer(id=str(uuid4()), text="A", is_correct=True)]
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
            difficulty=ReviewDifficultyEnum.MEDIUM,
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


class TestReviewRepositoryGet:
    """Tests pour récupérer une review"""

    def test_get_review_success(self, test_factory):
        """Récupérer une review existante."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        from daos.flashcard_dao import Flashcard, Answer
        from repositorys import flashcard_repository

        flashcard = Flashcard(
            id=str(uuid4()),
            question="Q?",
            note_id=note_id,
            answers=[Answer(id=str(uuid4()), text="A", is_correct=True)]
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

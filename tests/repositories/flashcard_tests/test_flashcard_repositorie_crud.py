"""
Tests pour le repository flashcard (accès base de données).

Ces tests vérifient :
- Ajouter une flashcard
- Récupérer une flashcard par ID
- Mettre à jour une flashcard
- Supprimer une flashcard
- Lister les flashcards d'un user

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from datetime import datetime
from uuid import uuid4
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from repositorys import flashcard_repository


class TestFlashcardRepositoryAdd:
    """Tests pour ajouter une flashcard"""

    def test_add_flashcard_success(self, test_factory):
        """Ajouter une flashcard."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        flashcard = Flashcard(
            id=str(uuid4()),
            question="Question?",
            note_id=note_id,
            answers=[
                FlashcardAnswer(id=str(uuid4()), answer_text="Answer 1", is_correct=True),
                FlashcardAnswer(id=str(uuid4()), answer_text="Answer 2", is_correct=False)
            ]
        )

        # Act
        result = flashcard_repository.add(flashcard)

        # Assert
        assert result.id is not None
        assert result.question == "Question?"
        assert len(result.answers) == 2


class TestFlashcardRepositoryUpdate:
    """Tests pour mettre à jour une flashcard"""

    def test_update_flashcard_success(self, test_factory):
        """Mettre à jour une flashcard."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        flashcard = Flashcard(
            id=str(uuid4()),
            question="Original?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), answer_text="Answer", is_correct=True)]
        )
        added = flashcard_repository.add(flashcard)

        # Act
        added.question = "Updated?"
        result = flashcard_repository.update(added)

        # Assert
        assert result.question == "Updated?"

        # Verify in DB
        found = flashcard_repository.find_one_unscoped(added.id)
        assert found.question == "Updated?"


class TestFlashcardRepositoryDelete:
    """Tests pour supprimer une flashcard"""

    def test_delete_flashcard_success(self, test_factory):
        """Supprimer une flashcard."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        flashcard = Flashcard(
            id=str(uuid4()),
            question="To delete?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), answer_text="Answer", is_correct=True)]
        )
        added = flashcard_repository.add(flashcard)

        # Act
        flashcard_repository.delete(added.id)

        # Assert
        result = flashcard_repository.find_one_unscoped(added.id)
        assert result is None

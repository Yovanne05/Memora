"""
Tests pour la suppression de flashcard (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from repositorys import flashcard_repository


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

"""
Tests pour la mise à jour de flashcard (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from repositorys import flashcard_repository


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

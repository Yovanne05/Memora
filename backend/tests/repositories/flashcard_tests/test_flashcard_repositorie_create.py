"""
Tests pour l'ajout de flashcard (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
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

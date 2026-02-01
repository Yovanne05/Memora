"""
Tests pour POST /notes/<note_id>/flashcards (create).

Le service flashcard_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestFlashcardControllerCreate:
    """Tests pour POST /notes/<note_id>/flashcards"""

    def test_create_flashcard_returns_201(self, authenticated_client, mock_flashcard_service):
        """Le endpoint POST /notes/<note_id>/flashcards retourne 201."""
        from dtos.flashcard_dto import FlashcardDTO

        # Arrange
        note_id = str(uuid4())
        flashcard = FlashcardDTO(
            id=str(uuid4()),
            question="New question?",
            note_id=note_id,
            answers=[],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
        mock_flashcard_service.create.return_value = flashcard

        payload = {
            "question": "New question?",
            "answers": [
                {"answer_text": "Answer 1", "is_correct": True},
                {"answer_text": "Answer 2", "is_correct": False}
            ]
        }

        # Act
        response = authenticated_client.post(f"/notes/{note_id}/flashcards", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["question"] == "New question?"
        mock_flashcard_service.create.assert_called_once()


class TestFlashcardControllerDuplicate:
    """Tests pour POST /flashcards/<id>/duplicates"""

    def test_duplicate_flashcard_returns_201(self, authenticated_client, mock_flashcard_service):
        """Le endpoint POST /flashcards/<id>/duplicates retourne 201."""
        from dtos.flashcard_dto import FlashcardDTO

        # Arrange
        flashcard_id = str(uuid4())
        duplicated = FlashcardDTO(
            id=str(uuid4()),
            question="Duplicated question?",
            note_id=str(uuid4()),
            answers=[],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
        mock_flashcard_service.duplicate.return_value = duplicated

        # Act
        response = authenticated_client.post(f"/flashcards/{flashcard_id}/duplicates")

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["id"] == duplicated.id
        mock_flashcard_service.duplicate.assert_called_once_with(flashcard_id)

"""
Tests pour PATCH /flashcards/<id> (update).

Le service flashcard_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestFlashcardControllerUpdate:
    """Tests pour PATCH /flashcards/<id>"""

    def test_update_flashcard_returns_200(self, authenticated_client, mock_flashcard_service):
        """Le endpoint PATCH /flashcards/<id> retourne 200."""
        from dtos.flashcard_dto import FlashcardDTO

        # Arrange
        flashcard_id = str(uuid4())
        flashcard = FlashcardDTO(
            id=flashcard_id,
            question="Updated question?",
            note_id=str(uuid4()),
            answers=[],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-02T00:00:00Z"
        )
        mock_flashcard_service.update.return_value = flashcard

        payload = {
            "question": "Updated question?"
        }

        # Act
        response = authenticated_client.patch(f"/flashcards/{flashcard_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["question"] == "Updated question?"
        mock_flashcard_service.update.assert_called_once()

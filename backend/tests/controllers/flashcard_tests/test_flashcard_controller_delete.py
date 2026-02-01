"""
Tests pour DELETE /flashcards/<id> (delete).

Le service flashcard_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestFlashcardControllerDelete:
    """Tests pour DELETE /flashcards/<id>"""

    def test_delete_flashcard_returns_204(self, authenticated_client, mock_flashcard_service):
        """Le endpoint DELETE /flashcards/<id> retourne 204."""
        # Arrange
        flashcard_id = str(uuid4())
        mock_flashcard_service.delete.return_value = None

        # Act
        response = authenticated_client.delete(f"/flashcards/{flashcard_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_flashcard_service.delete.assert_called_once_with(flashcard_id)

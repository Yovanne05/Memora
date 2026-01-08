"""
Tests pour le controller flashcard (routing et HTTP).

Ces tests vérifient :
- GET /flashcards (liste des flashcards)
- GET /flashcards/<id> (récupérer une flashcard)
- POST /notes/<note_id>/flashcards (créer une flashcard)
- PATCH /flashcards/<id> (modifier une flashcard)
- DELETE /flashcards/<id> (supprimer une flashcard)
- POST /flashcards/<id>/duplicates (dupliquer une flashcard)

Le service flashcard_service est MOCKÉ.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus


class TestFlashcardControllerList:
    """Tests pour GET /flashcards"""

    def test_list_flashcards_returns_200(self, app_client, mock_flashcard_service):
        """Le endpoint GET /flashcards retourne 200."""
        from dtos.flashcard_dto import FlashcardDTO

        # Arrange
        flashcards = [
            FlashcardDTO(
                id=str(uuid4()),
                question="Question 1?",
                note_id=str(uuid4()),
                answers=[],
                created_at="2024-01-01T00:00:00Z",
                updated_at="2024-01-01T00:00:00Z"
            )
        ]
        mock_flashcard_service.find_many.return_value = (flashcards, 1)

        # Act
        response = app_client.get("/flashcards")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1


class TestFlashcardControllerGet:
    """Tests pour GET /flashcards/<id>"""

    def test_get_flashcard_returns_200(self, app_client, mock_flashcard_service):
        """Le endpoint GET /flashcards/<id> retourne 200."""
        from dtos.flashcard_dto import FlashcardDTO

        # Arrange
        flashcard_id = str(uuid4())
        flashcard = FlashcardDTO(
            id=flashcard_id,
            question="Question?",
            note_id=str(uuid4()),
            answers=[],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
        mock_flashcard_service.find_one.return_value = flashcard

        # Act
        response = app_client.get(f"/flashcards/{flashcard_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == flashcard_id
        mock_flashcard_service.find_one.assert_called_once_with(flashcard_id)

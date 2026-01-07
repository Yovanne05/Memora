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


class TestFlashcardControllerCreate:
    """Tests pour POST /notes/<note_id>/flashcards"""

    def test_create_flashcard_returns_201(self, app_client, mock_flashcard_service):
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
        response = app_client.post(f"/notes/{note_id}/flashcards", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["question"] == "New question?"
        mock_flashcard_service.create.assert_called_once()


class TestFlashcardControllerUpdate:
    """Tests pour PATCH /flashcards/<id>"""

    def test_update_flashcard_returns_200(self, app_client, mock_flashcard_service):
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
        response = app_client.patch(f"/flashcards/{flashcard_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["question"] == "Updated question?"
        mock_flashcard_service.update.assert_called_once()


class TestFlashcardControllerDelete:
    """Tests pour DELETE /flashcards/<id>"""

    def test_delete_flashcard_returns_204(self, app_client, mock_flashcard_service):
        """Le endpoint DELETE /flashcards/<id> retourne 204."""
        # Arrange
        flashcard_id = str(uuid4())
        mock_flashcard_service.delete.return_value = None

        # Act
        response = app_client.delete(f"/flashcards/{flashcard_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_flashcard_service.delete.assert_called_once_with(flashcard_id)


class TestFlashcardControllerDuplicate:
    """Tests pour POST /flashcards/<id>/duplicates"""

    def test_duplicate_flashcard_returns_201(self, app_client, mock_flashcard_service):
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
        response = app_client.post(f"/flashcards/{flashcard_id}/duplicates")

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["id"] == duplicated.id
        mock_flashcard_service.duplicate.assert_called_once_with(flashcard_id)

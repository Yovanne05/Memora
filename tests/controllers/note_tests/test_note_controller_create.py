"""
Tests pour POST /notes (create).

Le service note_crud_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import VisibilityEnum


class TestNoteControllerCreate:
    """Tests pour POST /notes"""

    def test_create_note_returns_201(self, authenticated_client, mock_note_crud_service):
        """Le endpoint POST /notes retourne 201."""
        from dtos.note_dto import NoteDTO

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        created_note = NoteDTO(
            id=str(uuid4()),
            owner_id=owner_id,
            owner_username="testuser",
            title="New Note",
            visibility=VisibilityEnum.PRIVATE,
            collection_id=collection_id,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )
        mock_note_crud_service.create.return_value = created_note

        payload = {
            "title": "New Note",
            "owner_id": owner_id,
            "collection_id": collection_id,
            "visibility": "private"
        }

        # Act
        response = authenticated_client.post("/notes", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["title"] == "New Note"

    def test_create_note_returns_409_on_duplicate_title(self, authenticated_client, mock_note_crud_service):
        """Le endpoint retourne 409 si le titre existe deja."""
        from exceptions.note_exception import NoteTitleConflict

        # Arrange
        mock_note_crud_service.create.side_effect = NoteTitleConflict()

        payload = {
            "title": "Duplicate",
            "owner_id": str(uuid4()),
            "collection_id": str(uuid4())
        }

        # Act
        response = authenticated_client.post("/notes", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CONFLICT

import pytest
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import VisibilityEnum


class TestNoteControllerCreate:
    """Tests pour POST /notes"""

    def test_create_note_returns_201(self, app_client, mock_note_crud_service):
        """Le endpoint POST /notes retourne 201."""
        from dtos.note_dto import NoteDTO

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        created_note = NoteDTO(
            id=str(uuid4()),
            title="New Note",
            content="New content",
            collection_id=collection_id,
            visibility=VisibilityEnum.PRIVATE,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )
        mock_note_crud_service.create.return_value = created_note

        payload = {
            "title": "New Note",
            "content": "New content",
            "owner_id": owner_id,
            "collection_id": collection_id,
            "visibility": "private"
        }

        # Act
        response = app_client.post("/notes", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["title"] == "New Note"

    def test_create_note_returns_409_on_duplicate_title(self, app_client, mock_note_crud_service):
        """Le endpoint retourne 409 si le titre existe déjà."""
        from exceptions.note_exception import NoteTitleConflict

        # Arrange
        mock_note_crud_service.create.side_effect = NoteTitleConflict()

        payload = {
            "title": "Duplicate",
            "content": "Content",
            "owner_id": str(uuid4()),
            "collection_id": str(uuid4())
        }

        # Act
        response = app_client.post("/notes", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CONFLICT


class TestNoteControllerUpdate:
    """Tests pour PATCH /notes/<id>"""

    def test_update_note_returns_200(self, app_client, mock_note_crud_service):
        """Le endpoint PATCH /notes/<id> retourne 200."""
        from dtos.note_dto import NoteDTO

        # Arrange
        note_id = str(uuid4())
        updated_note = NoteDTO(
            id=note_id,
            title="Updated Title",
            content="Updated content",
            collection_id=str(uuid4()),
            visibility=VisibilityEnum.PUBLIC,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )
        mock_note_crud_service.update.return_value = updated_note

        payload = {
            "title": "Updated Title",
            "content": "Updated content"
        }

        # Act
        response = app_client.patch(f"/notes/{note_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["title"] == "Updated Title"


class TestNoteControllerDelete:
    """Tests pour DELETE /notes/<id>"""

    def test_delete_note_returns_204(self, app_client, mock_note_crud_service):
        """Le endpoint DELETE /notes/<id> retourne 204."""
        # Arrange
        note_id = str(uuid4())
        mock_note_crud_service.delete.return_value = None

        # Act
        response = app_client.delete(f"/notes/{note_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_crud_service.delete.assert_called_once_with(note_id)

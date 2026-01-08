import pytest
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import VisibilityEnum


class TestNoteControllerList:
    """Tests pour GET /notes (list)"""

    def test_list_notes_returns_200(self, app_client, mock_note_crud_service):
        """Le endpoint GET /notes retourne 200 avec une liste."""
        from dtos.note_dto import NoteDTO

        # Arrange
        mock_note_crud_service.find_many.return_value = (
            [
                NoteDTO(
                    id=str(uuid4()),
                    title="Note 1",
                    content="Content 1",
                    collection_id=str(uuid4()),
                    visibility=VisibilityEnum.PRIVATE,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    tags=[]
                ),
            ],
            1
        )

        # Act
        response = app_client.get("/notes")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body


class TestNoteControllerGet:
    """Tests pour GET /notes/<id>"""

    def test_get_note_returns_200(self, app_client, mock_note_crud_service):
        """Le endpoint GET /notes/<id> retourne 200."""
        from dtos.note_dto import NoteDTO

        # Arrange
        note_id = str(uuid4())
        mock_note_crud_service.find_one.return_value = NoteDTO(
            id=note_id,
            title="Test Note",
            content="Test content",
            collection_id=str(uuid4()),
            visibility=VisibilityEnum.PRIVATE,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )

        # Act
        response = app_client.get(f"/notes/{note_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == note_id

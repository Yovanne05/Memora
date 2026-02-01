from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import VisibilityEnum


class TestNoteControllerList:
    """Tests pour GET /notes (list)"""

    def test_list_notes_returns_200(self, authenticated_client, mock_note_crud_service):
        """Le endpoint GET /notes retourne 200 avec une liste."""
        from dtos.note_dto import NoteDTO

        # Arrange
        mock_note_crud_service.find_many.return_value = (
            [
                NoteDTO(
                    id=str(uuid4()),
                    owner_id=str(uuid4()),
                    owner_username="testuser",
                    title="Note 1",
                    visibility=VisibilityEnum.PRIVATE,
                    collection_id=str(uuid4()),
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    tags=[]
                ),
            ],
            1
        )

        # Act
        response = authenticated_client.get("/notes")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body


class TestNoteControllerGet:
    """Tests pour GET /notes/<id>"""

    def test_get_note_returns_200(self, authenticated_client, mock_note_crud_service):
        """Le endpoint GET /notes/<id> retourne 200."""
        from dtos.note_dto import NoteDTO

        # Arrange
        note_id = str(uuid4())
        mock_note_crud_service.find_one.return_value = NoteDTO(
            id=note_id,
            owner_id=str(uuid4()),
            owner_username="testuser",
            title="Test Note",
            visibility=VisibilityEnum.PRIVATE,
            collection_id=str(uuid4()),
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )

        # Act
        response = authenticated_client.get(f"/notes/{note_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == note_id

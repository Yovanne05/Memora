"""
Tests pour PATCH /notes/<id> (update).

Le service note_crud_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import VisibilityEnum


class TestNoteControllerUpdate:
    """Tests pour PATCH /notes/<id>"""

    def test_update_note_returns_200(self, authenticated_client, mock_note_crud_service):
        """Le endpoint PATCH /notes/<id> retourne 200."""
        from dtos.note_dto import NoteDTO

        # Arrange
        note_id = str(uuid4())
        updated_note = NoteDTO(
            id=note_id,
            owner_id=str(uuid4()),
            owner_username="testuser",
            title="Updated Title",
            visibility=VisibilityEnum.PUBLIC,
            collection_id=str(uuid4()),
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )
        mock_note_crud_service.update.return_value = updated_note

        payload = {
            "title": "Updated Title",
        }

        # Act
        response = authenticated_client.patch(f"/notes/{note_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["title"] == "Updated Title"

"""
Tests pour POST /notes/<id>/shares (create share).

Le service note_share_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import RoleEnum


class TestShareNoteControllerCreate:
    """Tests pour POST /notes/<id>/shares"""

    def test_create_share_returns_201(self, authenticated_client, mock_note_share_service):
        """Le endpoint POST /notes/<id>/shares retourne 201."""
        from dtos.note_share_dto import NoteShareDTO
        from dtos.user_dto import UserDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())

        user_dto = UserDTO(
            id=user_id,
            email="target@example.com",
            username="target",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        share = NoteShareDTO(
            note_id=note_id,
            user=user_dto,
            permission=SharePermissionEnum.WRITE,
            created_at=datetime.now()
        )
        mock_note_share_service.share_note.return_value = share

        payload = {
            "user_id": user_id,
            "permission": "write"
        }

        # Act
        response = authenticated_client.post(f"/notes/{note_id}/shares", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["note_id"] == note_id
        assert body["user"]["id"] == user_id
        mock_note_share_service.share_note.assert_called_once()

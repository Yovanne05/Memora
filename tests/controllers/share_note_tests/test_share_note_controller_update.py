"""
Tests pour PATCH /notes/<id>/shares/<user_id> (update share).

Le service note_share_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import RoleEnum


class TestShareNoteControllerUpdate:
    """Tests pour PATCH /notes/<id>/shares/<user_id>"""

    def test_update_share_returns_200(self, authenticated_client, mock_note_share_service):
        """Le endpoint PATCH /notes/<id>/shares/<user_id> retourne 200."""
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
            display_name="Target User",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        share = NoteShareDTO(
            note_id=note_id,
            user=user_dto,
            permission=SharePermissionEnum.WRITE,
            created_at=datetime.now()
        )
        mock_note_share_service.update_share.return_value = share

        payload = {
            "permission": "write"
        }

        # Act
        response = authenticated_client.patch(f"/notes/{note_id}/shares/{user_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["permission"] == "write"
        mock_note_share_service.update_share.assert_called_once()

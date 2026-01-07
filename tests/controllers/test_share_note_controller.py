"""
Tests pour le controller share_note (routing et HTTP).

Ces tests vérifient :
- GET /notes/<id>/shares (liste des partages)
- POST /notes/<id>/shares (partager une note)
- PATCH /notes/<id>/shares/<user_id> (modifier un partage)
- DELETE /notes/<id>/shares/<user_id> (supprimer un partage)

Le service note_share_service est MOCKÉ.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus


class TestShareNoteControllerList:
    """Tests pour GET /notes/<id>/shares"""

    def test_list_shares_returns_200(self, app_client, mock_note_share_service):
        """Le endpoint GET /notes/<id>/shares retourne 200."""
        from dtos.note_share_dto import NoteShareDTO
        from utils.enums import PermissionEnum

        # Arrange
        note_id = str(uuid4())
        shares = [
            NoteShareDTO(
                note_id=note_id,
                user_id=str(uuid4()),
                permission=PermissionEnum.READ,
                created_at="2024-01-01T00:00:00Z"
            )
        ]
        mock_note_share_service.find_many.return_value = (shares, 1)

        # Act
        response = app_client.get(f"/notes/{note_id}/shares")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1


class TestShareNoteControllerCreate:
    """Tests pour POST /notes/<id>/shares"""

    def test_create_share_returns_201(self, app_client, mock_note_share_service):
        """Le endpoint POST /notes/<id>/shares retourne 201."""
        from dtos.note_share_dto import NoteShareDTO
        from utils.enums import PermissionEnum

        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())

        share = NoteShareDTO(
            note_id=note_id,
            user_id=user_id,
            permission=PermissionEnum.WRITE,
            created_at="2024-01-01T00:00:00Z"
        )
        mock_note_share_service.share_note.return_value = share

        payload = {
            "user_id": user_id,
            "permission": "write"
        }

        # Act
        response = app_client.post(f"/notes/{note_id}/shares", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["note_id"] == note_id
        assert body["user_id"] == user_id
        mock_note_share_service.share_note.assert_called_once()


class TestShareNoteControllerUpdate:
    """Tests pour PATCH /notes/<id>/shares/<user_id>"""

    def test_update_share_returns_200(self, app_client, mock_note_share_service):
        """Le endpoint PATCH /notes/<id>/shares/<user_id> retourne 200."""
        from dtos.note_share_dto import NoteShareDTO
        from utils.enums import PermissionEnum

        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())

        share = NoteShareDTO(
            note_id=note_id,
            user_id=user_id,
            permission=PermissionEnum.WRITE,
            created_at="2024-01-01T00:00:00Z"
        )
        mock_note_share_service.update_share.return_value = share

        payload = {
            "permission": "write"
        }

        # Act
        response = app_client.patch(f"/notes/{note_id}/shares/{user_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["permission"] == "write"
        mock_note_share_service.update_share.assert_called_once()


class TestShareNoteControllerDelete:
    """Tests pour DELETE /notes/<id>/shares/<user_id>"""

    def test_delete_share_returns_204(self, app_client, mock_note_share_service):
        """Le endpoint DELETE /notes/<id>/shares/<user_id> retourne 204."""
        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())
        mock_note_share_service.revoke_share.return_value = None

        # Act
        response = app_client.delete(f"/notes/{note_id}/shares/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_share_service.revoke_share.assert_called_once_with(note_id, user_id)

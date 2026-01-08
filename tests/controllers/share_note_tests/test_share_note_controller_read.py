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
        from utils.enums import SharePermissionEnum

        # Arrange
        note_id = str(uuid4())
        shares = [
            NoteShareDTO(
                note_id=note_id,
                user_id=str(uuid4()),
                permission=SharePermissionEnum.READ,
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

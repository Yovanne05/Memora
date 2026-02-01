"""
Tests pour POST /notes/<id>/public-links (create link).

Le service note_share_link_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestNoteShareLinkControllerCreate:
    """Tests pour POST /notes/<id>/public-links"""

    def test_create_share_link_returns_201(self, authenticated_client, mock_note_share_link_service):
        """Le endpoint POST /notes/<id>/public-links retourne 201."""
        from dtos.note_share_link_dto import NoteShareLinkDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        note_id = str(uuid4())
        link = NoteShareLinkDTO(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ,
            created_at="2024-01-01T00:00:00Z"
        )
        mock_note_share_link_service.create_share_link.return_value = link

        payload = {
            "permission": "read"
        }

        # Act
        response = authenticated_client.post(f"/notes/{note_id}/public-links", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["note_id"] == note_id
        mock_note_share_link_service.create_share_link.assert_called_once()

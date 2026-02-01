"""
Tests pour le controller note_share_link (routing et HTTP).

Ces tests vérifient :
- GET /notes/<id>/public-links (liste des liens publics)
- POST /notes/<id>/public-links (créer un lien public)
- DELETE /notes/<id>/public-links/<link_id> (supprimer un lien public)

Le service note_share_link_service est MOCKÉ.
"""
from uuid import uuid4
from http import HTTPStatus


class TestNoteShareLinkControllerList:
    """Tests pour GET /notes/<id>/public-links"""

    def test_list_share_links_returns_200(self, authenticated_client, mock_note_share_link_service):
        """Le endpoint GET /notes/<id>/public-links retourne 200."""
        from dtos.note_share_link_dto import NoteShareLinkDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        note_id = str(uuid4())
        links = [
            NoteShareLinkDTO(
                id=str(uuid4()),
                note_id=note_id,
                permission=SharePermissionEnum.READ,
                created_at="2024-01-01T00:00:00Z"
            )
        ]
        mock_note_share_link_service.find_many.return_value = (links, 1)

        # Act
        response = authenticated_client.get(f"/notes/{note_id}/public-links")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1

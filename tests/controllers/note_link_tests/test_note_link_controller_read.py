"""
Tests pour le controller note_link (routing et HTTP).

Ces tests vérifient :
- GET /notes/<id>/relations (liste des liens entre notes)
- POST /notes/<id>/relations (créer un lien entre notes)
- DELETE /notes/<id>/relations/<linked_note_id> (supprimer un lien)

Le service note_link_service est MOCKÉ.
"""
from uuid import uuid4
from http import HTTPStatus


class TestNoteLinkControllerList:
    """Tests pour GET /notes/<id>/relations"""

    def test_list_note_links_returns_200(self, authenticated_client, mock_note_link_service):
        """Le endpoint GET /notes/<id>/relations retourne 200."""
        from dtos.note_link_dto import NoteLinkDTO
        from datetime import datetime

        # Arrange
        note_id = str(uuid4())
        links = [
            NoteLinkDTO(
                note_id=note_id,
                linked_note_id=str(uuid4()),
                created_at=datetime.now()
            )
        ]
        mock_note_link_service.find_many.return_value = (links, 1)

        # Act
        response = authenticated_client.get(f"/notes/{note_id}/relations")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1

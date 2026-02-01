"""
Tests pour DELETE /notes/<id>/public-links/<link_id> (delete link).

Le service note_share_link_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestNoteShareLinkControllerDelete:
    """Tests pour DELETE /notes/<id>/public-links/<link_id>"""

    def test_delete_share_link_returns_204(self, authenticated_client, mock_note_share_link_service):
        """Le endpoint DELETE /notes/<id>/public-links/<link_id> retourne 204."""
        # Arrange
        note_id = str(uuid4())
        link_id = str(uuid4())
        mock_note_share_link_service.delete_share_link.return_value = None

        # Act
        response = authenticated_client.delete(f"/notes/{note_id}/public-links/{link_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_share_link_service.delete_share_link.assert_called_once_with(note_id, link_id)

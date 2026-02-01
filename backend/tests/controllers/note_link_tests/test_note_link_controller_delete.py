"""
Tests pour DELETE /notes/<id>/relations/<linked_note_id> (delete link).

Le service note_link_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestNoteLinkControllerDelete:
    """Tests pour DELETE /notes/<id>/relations/<linked_note_id>"""

    def test_delete_note_link_returns_204(self, authenticated_client, mock_note_link_service):
        """Le endpoint DELETE /notes/<id>/relations/<linked_note_id> retourne 204."""
        # Arrange
        note_id = str(uuid4())
        linked_note_id = str(uuid4())
        mock_note_link_service.delete_link.return_value = None

        # Act
        response = authenticated_client.delete(f"/notes/{note_id}/relations/{linked_note_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_link_service.delete_link.assert_called_once_with(note_id, linked_note_id)

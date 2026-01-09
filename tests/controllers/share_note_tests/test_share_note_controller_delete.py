"""
Tests pour DELETE /notes/<id>/shares/<user_id> (delete share).

Le service note_share_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestShareNoteControllerDelete:
    """Tests pour DELETE /notes/<id>/shares/<user_id>"""

    def test_delete_share_returns_204(self, authenticated_client, mock_note_share_service):
        """Le endpoint DELETE /notes/<id>/shares/<user_id> retourne 204."""
        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())
        mock_note_share_service.revoke_share.return_value = None

        # Act
        response = authenticated_client.delete(f"/notes/{note_id}/shares/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_share_service.revoke_share.assert_called_once_with(note_id, user_id)

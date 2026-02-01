"""
Tests pour DELETE /notes/<id> (delete).

Le service note_crud_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestNoteControllerDelete:
    """Tests pour DELETE /notes/<id>"""

    def test_delete_note_returns_204(self, authenticated_client, mock_note_crud_service):
        """Le endpoint DELETE /notes/<id> retourne 204."""
        # Arrange
        note_id = str(uuid4())
        mock_note_crud_service.delete.return_value = None

        # Act
        response = authenticated_client.delete(f"/notes/{note_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_crud_service.delete.assert_called_once_with(note_id)

"""
Tests pour DELETE /users/<id> (delete).

Le service user_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestUserControllerDelete:
    """Tests pour DELETE /users/<id>"""

    def test_delete_user_returns_204(self, authenticated_client, mock_user_service):
        """Le endpoint DELETE /users/<id> retourne 204."""
        # Arrange
        user_id = str(uuid4())
        mock_user_service.delete.return_value = None

        # Act
        response = authenticated_client.delete(f"/users/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_user_service.delete.assert_called_once_with(user_id)

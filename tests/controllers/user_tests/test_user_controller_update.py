"""
Tests pour PATCH /users/<id> (update).

Le service user_service est MOCKE pour isoler le controller.
"""
from http import HTTPStatus
from datetime import datetime


class TestUserControllerUpdate:
    """Tests pour PATCH /users/<id>"""

    def test_update_user_returns_200(self, authenticated_client, mock_user_service):
        """Le endpoint PATCH /users/<id> retourne 200."""
        from dtos.user_dto import UserDTO

        # Arrange
        user_id = authenticated_client.user.id
        updated_user = UserDTO(
            id=user_id,
            email="test@example.com",
            username="newusername",
            role="client",
            created_at=datetime.now()
        )
        mock_user_service.update.return_value = updated_user

        payload = {
            "username": "newusername",
        }

        # Act
        response = authenticated_client.patch(f"/users/{user_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["username"] == "newusername"

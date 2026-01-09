"""
Tests pour le controller utilisateur.
Mock le service user_service.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime


class TestUserControllerGet:
    """Tests pour GET /users/<id>"""

    def test_get_user_returns_200(self, authenticated_client, mock_user_service):
        """Le endpoint GET /users/<id> retourne 200."""
        from dtos.user_dto import UserDTO

        # Arrange
        user_id = str(uuid4())
        mock_user_service.find_one.return_value = UserDTO(
            id=user_id,
            email="test@example.com",
            username="testuser",
            display_name="Test User",
            role="client",
            created_at=datetime.now()
        )

        # Act
        response = authenticated_client.get(f"/users/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == user_id

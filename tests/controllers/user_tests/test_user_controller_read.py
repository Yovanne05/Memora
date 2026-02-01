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
        """Le endpoint GET /users/<id> retourne 200 - user can access own profile."""
        from dtos.user_dto import UserDTO

        # Arrange - Use same ID as mock_current_user
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        mock_user_service.find_one.return_value = UserDTO(
            id=user_id,
            email="test@example.com",
            username="testuser",
            role="client",
            created_at=datetime.now()
        )

        # Act
        response = authenticated_client.get(f"/users/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == user_id

    def test_get_other_user_as_admin_returns_200(self, admin_client, mock_user_service):
        """Admin can access any user profile."""
        from dtos.user_dto import UserDTO

        # Arrange - Access different user as admin
        user_id = str(uuid4())
        mock_user_service.find_one.return_value = UserDTO(
            id=user_id,
            email="other@example.com",
            username="otheruser",
            role="client",
            created_at=datetime.now()
        )

        # Act
        response = admin_client.get(f"/users/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == user_id

    def test_get_other_user_as_client_returns_403(self, authenticated_client, mock_user_service):
        """Regular user cannot access other user profiles."""
        from dtos.user_dto import UserDTO

        # Arrange - Try to access different user as client
        other_user_id = str(uuid4())
        mock_user_service.find_one.return_value = UserDTO(
            id=other_user_id,
            email="other@example.com",
            username="otheruser",
            role="client",
            created_at=datetime.now()
        )

        # Act
        response = authenticated_client.get(f"/users/{other_user_id}")

        # Assert
        assert response.status_code == HTTPStatus.FORBIDDEN

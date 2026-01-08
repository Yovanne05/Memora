"""
Tests pour le controller utilisateur.
Mock le service user_service.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime


class TestUserControllerGet:
    """Tests pour GET /users/<id>"""

    def test_get_user_returns_200(self, app_client, mock_user_service):
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
        response = app_client.get(f"/users/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == user_id


class TestUserControllerUpdate:
    """Tests pour PATCH /users/<id>"""

    def test_update_user_returns_200(self, app_client, mock_user_service):
        """Le endpoint PATCH /users/<id> retourne 200."""
        from dtos.user_dto import UserDTO

        # Arrange
        user_id = str(uuid4())
        updated_user = UserDTO(
            id=user_id,
            email="test@example.com",
            username="newusername",
            display_name="New Display Name",
            role="client",
            created_at=datetime.now()
        )
        mock_user_service.update.return_value = updated_user

        payload = {
            "username": "newusername",
            "display_name": "New Display Name"
        }

        # Act
        response = app_client.patch(f"/users/{user_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["username"] == "newusername"


class TestUserControllerDelete:
    """Tests pour DELETE /users/<id>"""

    def test_delete_user_returns_204(self, app_client, mock_user_service):
        """Le endpoint DELETE /users/<id> retourne 204."""
        # Arrange
        user_id = str(uuid4())
        mock_user_service.delete.return_value = None

        # Act
        response = app_client.delete(f"/users/{user_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_user_service.delete.assert_called_once_with(user_id)

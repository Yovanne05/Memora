"""
Tests pour POST /users (register).

Le service user_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime


class TestAuthRegister:
    """Tests pour POST /users (register)"""

    def test_register_returns_201(self, authenticated_client, mock_user_service):
        """L'inscription retourne 201 avec l'utilisateur cree."""
        from dtos.user_dto import UserDTO
        from utils.enums import RoleEnum

        # Arrange
        mock_user_service.create.return_value = UserDTO(
            id=str(uuid4()),
            email="test@example.com",
            username="testuser",
            display_name="Test User",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        payload = {
            "email": "test@example.com",
            "password": "StrongPass1!",
            "username": "testuser",
            "display_name": "Test User"
        }

        # Act
        response = authenticated_client.post("/users", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["email"] == "test@example.com"
        mock_user_service.create.assert_called_once()

    def test_register_rejects_weak_password(self, authenticated_client, mock_user_service):
        """L'inscription rejette les mots de passe faibles."""
        payload = {
            "email": "test@example.com",
            "password": "weak",
            "username": "testuser"
        }

        # Act
        response = authenticated_client.post("/users", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
        mock_user_service.create.assert_not_called()

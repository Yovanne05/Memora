import pytest
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime


class TestAuthRegister:
    """Tests pour POST /users (register)"""

    def test_register_returns_201(self, app_client, mock_user_service):
        """L'inscription retourne 201 avec l'utilisateur créé."""
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
        response = app_client.post("/users", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["email"] == "test@example.com"
        mock_user_service.create.assert_called_once()

    def test_register_rejects_weak_password(self, app_client, mock_user_service):
        """L'inscription rejette les mots de passe faibles."""
        payload = {
            "email": "test@example.com",
            "password": "weak",
            "username": "testuser"
        }

        # Act
        response = app_client.post("/users", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
        mock_user_service.create.assert_not_called()


class TestAuthLogin:
    """Tests pour POST /sessions (login)"""

    def test_login_returns_200_with_token(self, app_client, mock_auth_service):
        """La connexion retourne 200 avec un token JWT."""
        from dtos.user_dto import UserDTO
        from utils.enums import RoleEnum

        # Arrange - Service returns tuple (UserDTO, token)
        user_dto = UserDTO(
            id=str(uuid4()),
            email="test@example.com",
            username="testuser",
            display_name="Test User",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        mock_auth_service.login.return_value = (user_dto, "fake.jwt.token")

        payload = {
            "identifier": "test@example.com",
            "password": "StrongPass1!"
        }

        # Act
        response = app_client.post("/sessions", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["user"]["email"] == "test@example.com"
        assert "access_token" in body
        mock_auth_service.login.assert_called_once()

    def test_login_returns_401_on_invalid_password(self, app_client, mock_auth_service):
        """La connexion retourne 401 avec un mauvais mot de passe."""
        from exceptions.auth_exception import InvalidCredentials

        # Arrange
        mock_auth_service.login.side_effect = InvalidCredentials()

        payload = {
            "identifier": "test@example.com",
            "password": "WrongPass123!"
        }

        # Act
        response = app_client.post("/sessions", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.UNAUTHORIZED


class TestAuthMe:
    """Tests pour GET /sessions/me (current user)"""

    def test_get_me_returns_current_user(self, authenticated_client, mock_auth_service):
        """GET /sessions/me retourne l'utilisateur connecté."""
        from dtos.user_dto import UserDTO
        from utils.enums import RoleEnum

        # Arrange - Service returns UserDTO directly
        mock_auth_service.get_me.return_value = UserDTO(
            id="test-user-id-123",
            email="test@example.com",
            username="testuser",
            display_name="Test User",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        # Act
        response = authenticated_client.get("/sessions/me")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["user"]["email"] == "test@example.com"

    def test_get_me_returns_401_without_token(self, app_client):
        """GET /sessions/me retourne 401 sans token."""
        # Act
        response = app_client.get("/sessions/me")

        # Assert
        assert response.status_code == HTTPStatus.UNAUTHORIZED

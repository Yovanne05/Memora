"""
Tests pour le service d'authentification (logique métier).

Ces tests vérifient la logique métier du service auth :
- Enregistrement d'utilisateurs
- Authentification
- Récupération des informations utilisateur
- Génération de tokens JWT

Les repositories et services sont MOCKÉS pour isoler la logique du service.
"""
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock
from dtos.auth_dto import LoginDTO, RegisterDTO
from dtos.user_dto import UserDTO
from daos.user_dao import User
from exceptions.auth_exception import InvalidCredentials
from exceptions.user_exception import UserNotFound
from utils.enums import RoleEnum


class TestAuthServiceRegister:
    """Tests pour l'enregistrement"""

    def test_register_success(self, mock_user_repository, monkeypatch):
        """Enregistrer un nouvel utilisateur avec des données valides."""
        from services.impl.auth_service_impl import auth_service

        # Mock du user_service.create
        user_dto = UserDTO(
            id=str(uuid4()),
            email="test@example.com",
            username="testuser",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        mock_user_service = Mock()
        mock_user_service.create.return_value = user_dto
        monkeypatch.setattr("services.impl.auth_service_impl.user_service", mock_user_service)

        register_dto = RegisterDTO(
            email="test@example.com",
            password="StrongPass1!",
            username="testuser",
        )

        # Act
        result_user, token = auth_service.register(register_dto)

        # Assert
        assert isinstance(result_user, UserDTO)
        assert result_user.email == "test@example.com"
        assert result_user.username == "testuser"
        assert isinstance(token, str)
        assert len(token) > 0
        mock_user_service.create.assert_called_once()

"""
Tests pour le service d'authentification (logique métier).

Ces tests vérifient la logique métier du service auth :
- Enregistrement d'utilisateurs
- Authentification
- Récupération des informations utilisateur
- Génération de tokens JWT

Les repositories et services sont MOCKÉS pour isoler la logique du service.
"""
import pytest
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock
from dtos.auth_dto import LoginDTO
from dtos.user_dto import UserDTO
from daos.user_dao import User
from exceptions.auth_exception import InvalidCredentials
from exceptions.user_exception import UserNotFound
from utils.enums import RoleEnum


class TestAuthServiceLogin:
    """Tests pour la connexion"""

    def test_login_success(self, mock_user_repository, monkeypatch):
        """Se connecter avec des identifiants valides."""
        from services.impl.auth_service_impl import auth_service
        import bcrypt

        user_id = str(uuid4())
        password = "StrongPass1!"
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user_entity = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash=password_hash,
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        mock_user_repository.find_one_by_identifier.return_value = user_entity
        mock_user_repository.update.return_value = user_entity

        mock_dto = UserDTO(
            id=user_id,
            email="test@example.com",
            username="testuser",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.auth_service_impl.user_to_dto", mock_mapper)

        login_dto = LoginDTO(
            identifier="test@example.com",
            password=password
        )

        # Act
        result_user, token = auth_service.login(login_dto)

        # Assert
        assert isinstance(result_user, UserDTO)
        assert result_user.email == "test@example.com"
        assert isinstance(token, str)
        assert len(token) > 0
        mock_user_repository.find_one_by_identifier.assert_called_once_with("test@example.com")
        mock_user_repository.update.assert_called_once()

    def test_login_user_not_found(self, mock_user_repository):
        """Se connecter avec un utilisateur inexistant lève InvalidCredentials."""
        from services.impl.auth_service_impl import auth_service

        # Arrange
        mock_user_repository.find_one_by_identifier.return_value = None

        login_dto = LoginDTO(
            identifier="unknown@example.com",
            password="Password1234!"
        )

        # Act & Assert
        with pytest.raises(InvalidCredentials):
            auth_service.login(login_dto)

        mock_user_repository.find_one_by_identifier.assert_called_once_with("unknown@example.com")
        mock_user_repository.update.assert_not_called()

    def test_login_wrong_password(self, mock_user_repository):
        """Se connecter avec un mauvais mot de passe lève InvalidCredentials."""
        from services.impl.auth_service_impl import auth_service
        import bcrypt

        # Arrange
        user_id = str(uuid4())
        correct_password = "CorrectPass123!"
        password_hash = bcrypt.hashpw(correct_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user_entity = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash=password_hash,
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        mock_user_repository.find_one_by_identifier.return_value = user_entity

        login_dto = LoginDTO(
            identifier="test@example.com",
            password="WrongPass1234!"
        )

        # Act & Assert
        with pytest.raises(InvalidCredentials):
            auth_service.login(login_dto)

        mock_user_repository.update.assert_not_called()


class TestAuthServiceGetMe:
    """Tests pour récupérer les informations de l'utilisateur connecté"""

    def test_get_me_success(self, mock_user_repository, monkeypatch):
        """Récupérer les informations de l'utilisateur connecté."""
        from services.impl.auth_service_impl import auth_service

        # Arrange
        user_id = str(uuid4())
        user_entity = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        mock_user_repository.find_one.return_value = user_entity

        mock_dto = UserDTO(
            id=user_id,
            email="test@example.com",
            username="testuser",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.auth_service_impl.user_to_dto", mock_mapper)

        # Act
        result = auth_service.get_me(user_id)

        # Assert
        assert isinstance(result, UserDTO)
        assert result.id == user_id
        assert result.email == "test@example.com"
        mock_user_repository.find_one.assert_called_once_with(user_id)

    def test_get_me_user_not_found(self, mock_user_repository):
        """Récupérer un utilisateur inexistant lève UserNotFound."""
        from services.impl.auth_service_impl import auth_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one.return_value = None

        # Act & Assert
        with pytest.raises(UserNotFound):
            auth_service.get_me(user_id)

        mock_user_repository.find_one.assert_called_once_with(user_id)

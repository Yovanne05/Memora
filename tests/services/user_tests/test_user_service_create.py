"""
Tests pour le service utilisateur (logique métier).

Ces tests vérifient la logique métier du service user :
- Création d'utilisateurs
- Mise à jour d'utilisateurs
- Suppression d'utilisateurs
- Validation des contraintes (email unique, username unique)
- Hashage des mots de passe

Les repositories sont MOCKÉS pour isoler la logique du service.
"""
import pytest
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock
from dtos.user_dto import UserCreateDTO, UserDTO
from daos.user_dao import User
from exceptions.user_exception import UserEmailConflict, UserUsernameConflict
from utils.enums import RoleEnum


class TestUserServiceCreate:
    """Tests pour la création d'utilisateur"""

    def test_create_user_success(self, mock_user_repository, monkeypatch):
        """Créer un utilisateur avec des données valides."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one_by_email.return_value = None
        mock_user_repository.find_one_by_username.return_value = None

        created_entity = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hashed_password",
            role=RoleEnum.CLIENT,
            created_at=datetime.now(),
        )
        mock_user_repository.add.return_value = created_entity

        mock_dto = UserDTO(
            id=user_id,
            email="test@example.com",
            username="testuser",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.user_service_impl.user_to_dto", mock_mapper)

        dto = UserCreateDTO(
            email="test@example.com",
            password="StrongPass1!",
            username="testuser",
            role=RoleEnum.CLIENT
        )

        # Act
        result = user_service.create(dto)

        # Assert
        assert isinstance(result, UserDTO)
        assert result.email == "test@example.com"
        assert result.username == "testuser"
        mock_user_repository.find_one_by_email.assert_called_once_with("test@example.com")
        mock_user_repository.add.assert_called_once()

    def test_create_user_raises_email_conflict(self, mock_user_repository):
        """Créer un utilisateur avec un email existant lève UserEmailConflict."""
        from services.impl.user_service_impl import user_service

        # Arrange
        existing_user = User(
            created_at=datetime.now(),
            id=str(uuid4()),
            email="existing@example.com",
            username="existing",
            password_hash="hash",
            role=RoleEnum.CLIENT
        )
        mock_user_repository.find_one_by_email.return_value = existing_user

        dto = UserCreateDTO(
            email="existing@example.com",
            password="StrongPass1!",
            username="newuser",
            role=RoleEnum.CLIENT
        )

        # Act & Assert
        with pytest.raises(UserEmailConflict):
            user_service.create(dto)

        mock_user_repository.add.assert_not_called()

    def test_create_user_raises_username_conflict(self, mock_user_repository):
        """Créer un utilisateur avec un username existant lève UserUsernameConflict."""
        from services.impl.user_service_impl import user_service

        # Arrange
        existing_user = User(
            created_at=datetime.now(),
            id=str(uuid4()),
            email="existing@example.com",
            username="existinguser",
            password_hash="hash",
            role=RoleEnum.CLIENT
        )
        mock_user_repository.find_one_by_email.return_value = None
        mock_user_repository.find_one_by_username.return_value = existing_user

        dto = UserCreateDTO(
            email="new@example.com",
            password="StrongPass1!",
            username="existinguser",
            role=RoleEnum.CLIENT
        )

        # Act & Assert
        with pytest.raises(UserUsernameConflict):
            user_service.create(dto)

        mock_user_repository.add.assert_not_called()

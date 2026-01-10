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
from dtos.user_dto import UserCreateDTO, UserUpdateDTO, UserDTO
from daos.user_dao import User
from exceptions.user_exception import UserNotFound, UserEmailConflict, UserUsernameConflict
from utils.enums import RoleEnum
from repositorys.user_repository import UserSearchParams


class TestUserServiceUpdate:
    """Tests pour la mise à jour d'utilisateur"""

    def test_update_user_success(self, mock_user_repository, monkeypatch):
        """Mettre à jour un utilisateur existant."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        existing_entity = User(
            id=user_id,
            email="old@example.com",
            username="olduser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now(),
        )
        updated_entity = User(
            id=user_id,
            email="new@example.com",
            username="newuser",
            password_hash="new_hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now(),
        )

        mock_user_repository.find_one.return_value = existing_entity
        mock_user_repository.find_one_by_email.return_value = None
        mock_user_repository.find_one_by_username.return_value = None
        mock_user_repository.update.return_value = updated_entity


        mock_dto = UserDTO(
            id=user_id,
            email="new@example.com",
            username="newuser",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.user_service_impl.user_to_dto", mock_mapper)

        dto = UserUpdateDTO(
            email="new@example.com",
            username="newuser",
        )

        # Act
        result = user_service.update(user_id, dto)

        # Assert
        assert result.email == "new@example.com"
        assert result.username == "newuser"
        mock_user_repository.find_one.assert_called_once_with(user_id)
        mock_user_repository.update.assert_called_once()

    def test_update_user_not_found(self, mock_user_repository):
        """Mettre à jour un utilisateur inexistant lève UserNotFound."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one.return_value = None

        dto = UserUpdateDTO(email="new@example.com")

        # Act & Assert
        with pytest.raises(UserNotFound):
            user_service.update(user_id, dto)

        mock_user_repository.update.assert_not_called()

    def test_update_user_email_conflict(self, mock_user_repository):
        """Mettre à jour avec un email déjà utilisé lève UserEmailConflict."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        other_user_id = str(uuid4())

        existing_entity = User(
            id=user_id,
            email="old@example.com",
            username="user",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now(),
        )
        other_user = User(
            id=other_user_id,
            email="taken@example.com",
            username="other",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now(),
        )

        mock_user_repository.find_one.return_value = existing_entity
        mock_user_repository.find_one_by_email.return_value = other_user

        dto = UserUpdateDTO(email="taken@example.com")

        # Act & Assert
        with pytest.raises(UserEmailConflict):
            user_service.update(user_id, dto)

        mock_user_repository.update.assert_not_called()

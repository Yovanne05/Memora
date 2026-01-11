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


class TestUserServiceDelete:
    """Tests pour la suppression d'utilisateur"""

    def test_delete_user_success(self, mock_user_repository):
        """Supprimer un utilisateur existant."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.delete.return_value = True

        # Act
        user_service.delete(user_id)

        # Assert
        mock_user_repository.delete.assert_called_once_with(user_id)

    def test_delete_user_not_found(self, mock_user_repository):
        """Supprimer un utilisateur inexistant lève UserNotFound."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.delete.return_value = False

        # Act & Assert
        with pytest.raises(UserNotFound):
            user_service.delete(user_id)

        mock_user_repository.delete.assert_called_once_with(user_id)

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


class TestUserServiceFindOne:
    """Tests pour la récupération d'un utilisateur"""

    def test_find_one_success(self, mock_user_repository, monkeypatch):
        """Récupérer un utilisateur existant."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        user_entity = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now(),
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
        monkeypatch.setattr("services.impl.user_service_impl.user_to_dto", mock_mapper)

        # Act
        result = user_service.find_one(user_id)

        # Assert
        assert isinstance(result, UserDTO)
        assert result.id == user_id
        assert result.email == "test@example.com"
        mock_user_repository.find_one.assert_called_once_with(user_id)

    def test_find_one_not_found(self, mock_user_repository):
        """Récupérer un utilisateur inexistant lève UserNotFound."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one.return_value = None

        # Act & Assert
        with pytest.raises(UserNotFound):
            user_service.find_one(user_id)

        mock_user_repository.find_one.assert_called_once_with(user_id)


class TestUserServiceFindMany:
    """Tests pour la récupération de plusieurs utilisateurs"""

    def test_find_many_returns_all(self, mock_user_repository, monkeypatch):
        """Récupérer tous les utilisateurs."""
        from services.impl.user_service_impl import user_service

        # Arrange
        entities = [
            User(id=str(uuid4()), email=f"user{i}@example.com", username=f"user{i}", password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now())
            for i in range(3)
        ]
        mock_user_repository.find_many.return_value = (entities, 3)


        mock_dtos = [
            UserDTO(
                id=entity.id,
                email=entity.email,
                username=entity.username,
                role=RoleEnum.CLIENT,
                created_at=datetime.now()
            )
            for entity in entities
        ]
        mock_mapper = Mock(side_effect=mock_dtos)
        monkeypatch.setattr("services.impl.user_service_impl.user_to_dto", mock_mapper)

        params = UserSearchParams()

        # Act
        results, total = user_service.find_many(params)

        # Assert
        assert len(results) == 3
        assert total == 3
        assert all(isinstance(r, UserDTO) for r in results)
        mock_user_repository.find_many.assert_called_once_with(params)

    def test_find_many_with_filters(self, mock_user_repository):
        """Récupérer les utilisateurs avec filtres."""
        from services.impl.user_service_impl import user_service

        # Arrange
        mock_user_repository.find_many.return_value = ([], 0)

        params = UserSearchParams(role=RoleEnum.ADMIN)

        # Act
        results, total = user_service.find_many(params)

        # Assert
        assert len(results) == 0
        assert total == 0
        mock_user_repository.find_many.assert_called_once_with(params)

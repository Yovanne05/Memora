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
from uuid import uuid4

from dtos.user_dto import UserCreateDTO, UserUpdateDTO, UserDTO
from daos.user_dao import User
from exceptions.user_exception import UserNotFound, UserEmailConflict, UserUsernameConflict
from utils.enums import RoleEnum
from repositorys.user_repository import UserSearchParams


class TestUserServiceCreate:
    """Tests pour la création d'utilisateur"""

    def test_create_user_success(self, mock_user_repository):
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
            display_name="Test User",
            password_hash="hashed_password",
            role=RoleEnum.CLIENT
        )
        mock_user_repository.add.return_value = created_entity

        dto = UserCreateDTO(
            email="test@example.com",
            password="StrongPass1!",
            username="testuser",
            display_name="Test User",
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


class TestUserServiceFindOne:
    """Tests pour la récupération d'un utilisateur"""

    def test_find_one_success(self, mock_user_repository):
        """Récupérer un utilisateur existant."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        user_entity = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            display_name="Test User",
            password_hash="hash",
            role=RoleEnum.CLIENT
        )
        mock_user_repository.find_one.return_value = user_entity

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


class TestUserServiceUpdate:
    """Tests pour la mise à jour d'utilisateur"""

    def test_update_user_success(self, mock_user_repository):
        """Mettre à jour un utilisateur existant."""
        from services.impl.user_service_impl import user_service

        # Arrange
        user_id = str(uuid4())
        existing_entity = User(
            id=user_id,
            email="old@example.com",
            username="olduser",
            display_name="Old Name",
            password_hash="hash",
            role=RoleEnum.CLIENT
        )
        updated_entity = User(
            id=user_id,
            email="new@example.com",
            username="newuser",
            display_name="New Name",
            password_hash="new_hash",
            role=RoleEnum.CLIENT
        )

        mock_user_repository.find_one.return_value = existing_entity
        mock_user_repository.find_one_by_email.return_value = None
        mock_user_repository.find_one_by_username.return_value = None
        mock_user_repository.update.return_value = updated_entity

        dto = UserUpdateDTO(
            email="new@example.com",
            username="newuser",
            display_name="New Name"
        )

        # Act
        result = user_service.update(user_id, dto)

        # Assert
        assert result.email == "new@example.com"
        assert result.username == "newuser"
        assert result.display_name == "New Name"
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
            role=RoleEnum.CLIENT
        )
        other_user = User(
            id=other_user_id,
            email="taken@example.com",
            username="other",
            password_hash="hash",
            role=RoleEnum.CLIENT
        )

        mock_user_repository.find_one.return_value = existing_entity
        mock_user_repository.find_one_by_email.return_value = other_user

        dto = UserUpdateDTO(email="taken@example.com")

        # Act & Assert
        with pytest.raises(UserEmailConflict):
            user_service.update(user_id, dto)

        mock_user_repository.update.assert_not_called()


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


class TestUserServiceFindMany:
    """Tests pour la récupération de plusieurs utilisateurs"""

    def test_find_many_returns_all(self, mock_user_repository):
        """Récupérer tous les utilisateurs."""
        from services.impl.user_service_impl import user_service

        # Arrange
        entities = [
            User(id=str(uuid4()), email=f"user{i}@example.com", username=f"user{i}", password_hash="hash", role=RoleEnum.CLIENT)
            for i in range(3)
        ]
        mock_user_repository.find_many.return_value = (entities, 3)

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

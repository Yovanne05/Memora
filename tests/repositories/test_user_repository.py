"""
Tests pour le repository utilisateur (accès base de données).

Ces tests vérifient l'interaction avec la base de données :
- Insertion, mise à jour, suppression d'utilisateurs
- Requêtes SQL (filtres, tri, pagination)
- Contraintes de base de données (email unique, username unique)
- Recherche par email/username/identifier

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from datetime import datetime
from uuid import uuid4
import bcrypt

from daos.user_dao import User
from repositorys import user_repository
from repositorys.user_repository import UserSearchParams
from utils.enums import RoleEnum


class TestUserRepositoryAdd:
    """Tests pour l'ajout d'utilisateur"""

    def test_add_user_success(self):
        """Ajouter un utilisateur avec des données valides."""
        # Arrange
        user = User(
            id=str(uuid4()),
            email=f"test-{uuid4().hex[:8]}@example.com",
            username=f"user-{uuid4().hex[:8]}",
            display_name="Test User",
            password_hash=bcrypt.hashpw("Password1!".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            role=RoleEnum.CLIENT
        )

        # Act
        result = user_repository.add(user)

        # Assert
        assert result.id is not None
        assert result.email == user.email
        assert result.username == user.username
        assert result.role == RoleEnum.CLIENT

    def test_add_user_generates_id(self):
        """L'ID est bien persisté en base."""
        # Arrange
        user_id = str(uuid4())
        user = User(
            id=user_id,
            email=f"test-{uuid4().hex[:8]}@example.com",
            username=f"user-{uuid4().hex[:8]}",
            password_hash=bcrypt.hashpw("Password1!".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            role=RoleEnum.CLIENT
        )

        # Act
        result = user_repository.add(user)

        # Assert
        assert result.id == user_id

        # Vérifier qu'on peut le retrouver
        found = user_repository.find_one(user_id)
        assert found is not None
        assert found.id == user_id


class TestUserRepositoryFindOne:
    """Tests pour la récupération d'un utilisateur"""

    def test_find_one_by_id_success(self, test_factory):
        """Récupérer un utilisateur par ID."""
        # Arrange
        user_id = test_factory.create_user()

        # Act
        result = user_repository.find_one(user_id)

        # Assert
        assert result is not None
        assert result.id == user_id

    def test_find_one_by_id_not_found(self):
        """Récupérer un utilisateur inexistant retourne None."""
        # Arrange
        non_existent_id = str(uuid4())

        # Act
        result = user_repository.find_one(non_existent_id)

        # Assert
        assert result is None

    def test_find_one_by_email(self, test_factory):
        """Récupérer un utilisateur par email."""
        # Arrange
        user_id = test_factory.create_user(label="emailtest")

        # Act
        result = user_repository.find_one_by_email("user-emailtest@example.com")

        # Assert
        assert result is not None
        assert result.id == user_id
        assert result.email == "user-emailtest@example.com"

    def test_find_one_by_username(self, test_factory):
        """Récupérer un utilisateur par username."""
        # Arrange
        user_id = test_factory.create_user(label="usertest")

        # Act
        result = user_repository.find_one_by_username("user-usertest")

        # Assert
        assert result is not None
        assert result.id == user_id
        assert result.username == "user-usertest"

    def test_find_one_by_identifier_with_email(self, test_factory):
        """Récupérer un utilisateur par identifier (email)."""
        # Arrange
        user_id = test_factory.create_user(label="identifier1")

        # Act
        result = user_repository.find_one_by_identifier("user-identifier1@example.com")

        # Assert
        assert result is not None
        assert result.id == user_id

    def test_find_one_by_identifier_with_username(self, test_factory):
        """Récupérer un utilisateur par identifier (username)."""
        # Arrange
        user_id = test_factory.create_user(label="identifier2")

        # Act
        result = user_repository.find_one_by_identifier("user-identifier2")

        # Assert
        assert result is not None
        assert result.id == user_id


class TestUserRepositoryFindMany:
    """Tests pour la récupération de plusieurs utilisateurs"""

    def test_find_many_returns_all(self, test_factory):
        """Récupérer tous les utilisateurs."""
        # Arrange
        test_factory.create_user(label="user1")
        test_factory.create_user(label="user2")
        test_factory.create_user(label="user3")

        params = UserSearchParams()

        # Act
        results, total = user_repository.find_many(params)

        # Assert
        assert total >= 3  # Au moins les 3 qu'on a créés
        assert len(results) >= 3

    def test_find_many_filters_by_role(self, test_factory):
        """Filtrer les utilisateurs par rôle."""
        # Arrange
        test_factory.create_user(label="client1", role=RoleEnum.CLIENT)
        test_factory.create_user(label="client2", role=RoleEnum.CLIENT)
        test_factory.create_user(label="admin1", role=RoleEnum.ADMIN)

        params = UserSearchParams(role=RoleEnum.CLIENT)

        # Act
        results, total = user_repository.find_many(params)

        # Assert
        assert total >= 2
        assert all(r.role == RoleEnum.CLIENT for r in results)

    def test_find_many_pagination(self, test_factory):
        """La pagination fonctionne correctement."""
        # Arrange
        for i in range(10):
            test_factory.create_user(label=f"pagination{i}")

        params = UserSearchParams(
            limit=5,
            offset=0
        )

        # Act
        results, total = user_repository.find_many(params)

        # Assert
        assert total >= 10
        assert len(results) == 5  # Seulement 5 résultats (limit)


class TestUserRepositoryUpdate:
    """Tests pour la mise à jour d'utilisateur"""

    def test_update_user_success(self, test_factory):
        """Mettre à jour un utilisateur."""
        # Arrange
        user_id = test_factory.create_user(label="olduser")

        # Act
        user = user_repository.find_one(user_id)
        user.email = f"new-{uuid4().hex[:8]}@example.com"
        user.display_name = "New Display Name"
        result = user_repository.update(user)

        # Assert
        assert result.email == user.email
        assert result.display_name == "New Display Name"

        # Vérifier en base
        updated = user_repository.find_one(user_id)
        assert updated.email == user.email
        assert updated.display_name == "New Display Name"


class TestUserRepositoryDelete:
    """Tests pour la suppression d'utilisateur"""

    def test_delete_user_success(self, test_factory):
        """Supprimer un utilisateur."""
        # Arrange
        user_id = test_factory.create_user(label="todelete")

        # Act
        result = user_repository.delete(user_id)

        # Assert
        assert result is True

        # Vérifier que l'utilisateur n'existe plus
        found = user_repository.find_one(user_id)
        assert found is None

    def test_delete_user_not_found(self):
        """Supprimer un utilisateur inexistant retourne False."""
        # Arrange
        non_existent_id = str(uuid4())

        # Act
        result = user_repository.delete(non_existent_id)

        # Assert
        assert result is False


class TestUserRepositoryConstraints:
    """Tests pour les contraintes de base de données"""

    def test_unique_email(self, test_factory):
        """L'email doit être unique."""
        # Arrange
        test_factory.create_user(label="unique1")

        # Act & Assert
        # Essayer de créer un utilisateur avec le même email
        with pytest.raises(Exception):  # IntegrityError ou équivalent
            user = User(
                id=str(uuid4()),
                email="user-unique1@example.com",  # Email déjà utilisé
                username=f"user-{uuid4().hex[:8]}",
                password_hash=bcrypt.hashpw("Password1!".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
                role=RoleEnum.CLIENT
            )
            user_repository.add(user)

    def test_unique_username(self, test_factory):
        """Le username doit être unique."""
        # Arrange
        test_factory.create_user(label="unique2")

        # Act & Assert
        # Essayer de créer un utilisateur avec le même username
        with pytest.raises(Exception):  # IntegrityError ou équivalent
            user = User(
                id=str(uuid4()),
                email=f"test-{uuid4().hex[:8]}@example.com",
                username="user-unique2",  # Username déjà utilisé
                password_hash=bcrypt.hashpw("Password1!".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
                role=RoleEnum.CLIENT
            )
            user_repository.add(user)

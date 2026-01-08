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
        assert len(results) == 5

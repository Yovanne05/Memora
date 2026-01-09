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

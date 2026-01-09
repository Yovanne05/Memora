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

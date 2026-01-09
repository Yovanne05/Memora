"""
Tests pour l'ajout d'utilisateur (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
import bcrypt
from daos.user_dao import User
from repositorys import user_repository
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

"""
Tests pour la mise à jour d'utilisateur (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from repositorys import user_repository


class TestUserRepositoryUpdate:
    """Tests pour la mise à jour d'utilisateur"""

    def test_update_user_success(self, test_factory):
        """Mettre à jour un utilisateur."""
        # Arrange
        user_id = test_factory.create_user(label="olduser")

        # Act
        user = user_repository.find_one(user_id)
        user.email = f"new-{uuid4().hex[:8]}@example.com"
        result = user_repository.update(user)

        # Assert
        assert result.email == user.email

        # Vérifier en base
        updated = user_repository.find_one(user_id)
        assert updated.email == user.email

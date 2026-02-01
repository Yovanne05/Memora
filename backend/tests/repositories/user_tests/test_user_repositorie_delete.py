"""
Tests pour la suppression d'utilisateur (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from repositorys import user_repository


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

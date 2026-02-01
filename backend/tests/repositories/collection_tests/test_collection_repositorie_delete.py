"""
Tests pour la suppression de collection (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from repositorys import collection_repository


class TestCollectionRepositoryDelete:
    """Tests pour la suppression de collection"""

    def test_delete_collection_success(self, test_factory):
        """Supprimer une collection."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id, name="To Delete")

        # Act
        collection_repository.delete(collection_id)

        # Assert
        result = collection_repository.find_one_unscoped(collection_id)
        assert result is None

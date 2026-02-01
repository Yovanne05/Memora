"""
Tests pour la mise à jour de collection (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from repositorys import collection_repository


class TestCollectionRepositoryUpdate:
    """Tests pour la mise à jour de collection"""

    def test_update_collection_success(self, test_factory):
        """Mettre à jour une collection."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id, name="Old Name")

        # Act
        collection = collection_repository.find_one_unscoped(collection_id)
        collection.name = "New Name"
        collection.description = "New Description"
        result = collection_repository.update(collection)

        # Assert
        assert result.name == "New Name"
        assert result.description == "New Description"

        # Vérifier en base
        updated = collection_repository.find_one_unscoped(collection_id)
        assert updated.name == "New Name"
        assert updated.description == "New Description"

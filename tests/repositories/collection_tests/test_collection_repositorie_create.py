"""
Tests pour l'ajout de collection (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.collection_dao import Collection
from repositorys import collection_repository
from utils.enums import VisibilityEnum


class TestCollectionRepositoryAdd:
    """Tests pour l'ajout de collection"""

    def test_add_collection_success(self, test_factory):
        """Ajouter une collection avec des données valides."""
        # Arrange
        user_id = test_factory.create_user()
        collection = Collection(
            id=str(uuid4()),
            name="Test Collection",
            description="Test description",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE
        )

        # Act
        result = collection_repository.add(collection)

        # Assert
        assert result.id is not None
        assert result.name == "Test Collection"
        assert result.owner_id == user_id
        assert result.visibility == VisibilityEnum.PRIVATE

    def test_add_collection_generates_id(self, test_factory):
        """L'ID est bien persisté en base."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = str(uuid4())
        collection = Collection(
            id=collection_id,
            name="Test Collection",
            owner_id=user_id
        )

        # Act
        result = collection_repository.add(collection)

        # Assert
        assert result.id == collection_id

        # Vérifier qu'on peut la retrouver
        found = collection_repository.find_one_unscoped(collection_id)
        assert found is not None
        assert found.id == collection_id

    def test_add_collection_with_foreign_key(self, test_factory):
        """La contrainte foreign key owner_id est respectée."""
        # Arrange
        user_id = test_factory.create_user()
        collection = Collection(
            id=str(uuid4()),
            name="Test Collection",
            owner_id=user_id  # User existe
        )

        # Act
        result = collection_repository.add(collection)

        # Assert
        assert result.owner_id == user_id

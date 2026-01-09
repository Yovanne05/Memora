"""
Tests pour le repository de collection (accès base de données).

Ces tests vérifient l'interaction avec la base de données :
- Insertion, mise à jour, suppression
- Requêtes SQL (filtres, tri, pagination)
- Contraintes de base de données (foreign keys, unique, etc.)
- Transactions et rollback

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from datetime import datetime
from uuid import uuid4
from daos.collection_dao import Collection
from repositorys import collection_repository
from repositorys.collection_repository import CollectionSearchParams
from utils.enums import VisibilityEnum


class TestCollectionRepositoryFindOne:
    """Tests pour la récupération d'une collection"""

    def test_find_one_by_id_success(self, test_factory):
        """Récupérer une collection par ID."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id, name="Find Me")

        # Act
        result = collection_repository.find_one_unscoped(collection_id)

        # Assert
        assert result is not None
        assert result.id == collection_id
        assert result.name == "Find Me"
        assert result.owner_id == user_id

    def test_find_one_by_id_not_found(self):
        """Récupérer une collection inexistante retourne None."""
        # Arrange
        non_existent_id = str(uuid4())

        # Act
        result = collection_repository.find_one_unscoped(non_existent_id)

        # Assert
        assert result is None

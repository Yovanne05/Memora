"""
Tests pour le repository de collection (accès base de données).

Ces tests vérifient l'interaction avec la base de données :
- Insertion, mise à jour, suppression
- Requêtes SQL (filtres, tri, pagination)
- Contraintes de base de données (foreign keys, unique, etc.)
- Transactions et rollback

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from uuid import uuid4
from daos.collection_dao import Collection
from repositorys import collection_repository


class TestCollectionRepositoryConstraints:
    """Tests pour les contraintes de base de données"""

    def test_unique_name_per_owner(self, test_factory):
        """Le nom de collection doit être unique par owner."""
        # Arrange
        user_id = test_factory.create_user()
        test_factory.create_collection(owner_id=user_id, name="Duplicate Name")

        # Act & Assert
        # Essayer de créer une collection avec le même nom pour le même user
        # Devrait lever une exception (IntegrityError ou équivalent)
        with pytest.raises(Exception):  # À adapter selon votre gestion d'erreur
            collection = Collection(
                id=str(uuid4()),
                name="Duplicate Name",
                owner_id=user_id
            )
            collection_repository.add(collection)

    def test_different_owners_can_have_same_name(self, test_factory):
        """Deux owners différents peuvent avoir des collections avec le même nom."""
        # Arrange
        user1_id = test_factory.create_user(label="user1")
        user2_id = test_factory.create_user(label="user2")

        # Act
        collection1_id = test_factory.create_collection(owner_id=user1_id, name="Same Name")
        collection2_id = test_factory.create_collection(owner_id=user2_id, name="Same Name")

        # Assert
        assert collection1_id != collection2_id

        collection1 = collection_repository.find_one_unscoped(collection1_id)
        collection2 = collection_repository.find_one_unscoped(collection2_id)

        assert collection1.name == collection2.name == "Same Name"
        assert collection1.owner_id != collection2.owner_id

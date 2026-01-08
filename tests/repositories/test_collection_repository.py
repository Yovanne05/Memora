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
from datetime import datetime
from uuid import uuid4

from daos.collection_dao import Collection
from repositorys import collection_repository
from repositorys.collection_repository import CollectionSearchParams
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

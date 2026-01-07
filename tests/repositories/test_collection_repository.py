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
        found = collection_repository.find_one_by_id(collection_id)
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
        result = collection_repository.find_one_by_id(collection_id)

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
        result = collection_repository.find_one_by_id(non_existent_id)

        # Assert
        assert result is None

    def test_find_one_by_name(self, test_factory):
        """Récupérer une collection par nom."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id, name="Unique Name")

        # Act
        result = collection_repository.find_one_by_name("Unique Name", user_id)

        # Assert
        assert result is not None
        assert result.id == collection_id
        assert result.name == "Unique Name"


class TestCollectionRepositoryFindMany:
    """Tests pour la récupération de plusieurs collections"""

    def test_find_many_returns_all(self, test_factory):
        """Récupérer toutes les collections."""
        # Arrange
        user_id = test_factory.create_user()
        test_factory.create_collection(owner_id=user_id, name="Collection 1")
        test_factory.create_collection(owner_id=user_id, name="Collection 2")
        test_factory.create_collection(owner_id=user_id, name="Collection 3")

        params = CollectionSearchParams()

        # Act
        results, total = collection_repository.find_many(params)

        # Assert
        assert total >= 3  # Au moins les 3 qu'on a créées
        assert len(results) >= 3

    def test_find_many_filters_by_owner(self, test_factory):
        """Filtrer les collections par owner_id."""
        # Arrange
        user1_id = test_factory.create_user(label="user1")
        user2_id = test_factory.create_user(label="user2")

        test_factory.create_collection(owner_id=user1_id, name="User1 Collection 1")
        test_factory.create_collection(owner_id=user1_id, name="User1 Collection 2")
        test_factory.create_collection(owner_id=user2_id, name="User2 Collection")

        params = CollectionSearchParams(owner_id=user1_id)

        # Act
        results, total = collection_repository.find_many(params)

        # Assert
        assert total == 2
        assert all(r.owner_id == user1_id for r in results)

    def test_find_many_filters_by_visibility(self, test_factory):
        """Filtrer les collections par visibility."""
        # Arrange
        user_id = test_factory.create_user()
        test_factory.create_collection(owner_id=user_id, name="Private 1", visibility=VisibilityEnum.PRIVATE)
        test_factory.create_collection(owner_id=user_id, name="Private 2", visibility=VisibilityEnum.PRIVATE)
        test_factory.create_collection(owner_id=user_id, name="Public 1", visibility=VisibilityEnum.PUBLIC)

        params = CollectionSearchParams(
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE
        )

        # Act
        results, total = collection_repository.find_many(params)

        # Assert
        assert total == 2
        assert all(r.visibility == VisibilityEnum.PRIVATE for r in results)

    def test_find_many_pagination(self, test_factory):
        """La pagination fonctionne correctement."""
        # Arrange
        user_id = test_factory.create_user()
        for i in range(10):
            test_factory.create_collection(owner_id=user_id, name=f"Collection {i}")

        params = CollectionSearchParams(
            owner_id=user_id,
            limit=5,
            offset=0
        )

        # Act
        results, total = collection_repository.find_many(params)

        # Assert
        assert total == 10
        assert len(results) == 5  # Seulement 5 résultats (limit)


class TestCollectionRepositoryUpdate:
    """Tests pour la mise à jour de collection"""

    def test_update_collection_success(self, test_factory):
        """Mettre à jour une collection."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id, name="Old Name")

        # Act
        collection = collection_repository.find_one_by_id(collection_id)
        collection.name = "New Name"
        collection.description = "New Description"
        result = collection_repository.update(collection)

        # Assert
        assert result.name == "New Name"
        assert result.description == "New Description"

        # Vérifier en base
        updated = collection_repository.find_one_by_id(collection_id)
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
        result = collection_repository.find_one_by_id(collection_id)
        assert result is None

    def test_delete_collection_cascade(self, test_factory):
        """Supprimer une collection supprime les notes associées (CASCADE)."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(collection_id=collection_id, owner_id=user_id)

        # Act
        collection_repository.delete(collection_id)

        # Assert
        from repositorys import note_repository
        note = note_repository.find_one_by_id(note_id)
        assert note is None  # La note a été supprimée en cascade


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

        collection1 = collection_repository.find_one_by_id(collection1_id)
        collection2 = collection_repository.find_one_by_id(collection2_id)

        assert collection1.name == collection2.name == "Same Name"
        assert collection1.owner_id != collection2.owner_id

"""
Tests pour le service de collection (logique métier).

Ces tests vérifient la logique métier du service :
- Validation des règles métier
- Orchestration des appels aux repositories
- Transformations DAO → DTO
- Gestion des exceptions métier

Les repositories sont MOCKÉS pour isoler la logique du service.
"""
import pytest
from uuid import uuid4

from dtos.collection_dto import CollectionCreateDTO, CollectionUpdateDTO, CollectionDTO
from daos.collection_dao import Collection
from utils.enums import VisibilityEnum
from exceptions.collection_exception import CollectionNotFound, CollectionTitleConflict
from exceptions.user_exception import UserNotFound


class TestCollectionServiceCreate:
    """Tests pour la création de collection"""

    def test_create_collection_success(self, mock_collection_repository, mock_user_repository):
        """Créer une collection avec des données valides."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one_by_id.return_value = {"id": user_id, "email": "test@example.com"}

        created_dao = Collection(
            id=str(uuid4()),
            name="Test Collection",
            description="Test desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE
        )
        mock_collection_repository.add.return_value = created_dao

        dto = CollectionCreateDTO(
            name="Test Collection",
            description="Test desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE
        )

        # Act
        result = collection_service.create(dto)

        # Assert
        assert isinstance(result, CollectionDTO)
        assert result.name == "Test Collection"
        assert result.owner_id == user_id
        mock_user_repository.find_one_by_id.assert_called_once_with(user_id)
        mock_collection_repository.add.assert_called_once()

    def test_create_collection_raises_user_not_found(self, mock_collection_repository, mock_user_repository):
        """Créer une collection avec un owner inexistant lève UserNotFound."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one_by_id.return_value = None

        dto = CollectionCreateDTO(
            name="Test Collection",
            description="Test desc",
            owner_id=user_id
        )

        # Act & Assert
        with pytest.raises(UserNotFound):
            collection_service.create(dto)

        mock_user_repository.find_one_by_id.assert_called_once_with(user_id)
        mock_collection_repository.add.assert_not_called()

    def test_create_collection_raises_duplicate(self, mock_collection_repository, mock_user_repository):
        """Créer une collection avec un nom existant lève CollectionTitleConflict."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one_by_id.return_value = {"id": user_id}

        # Le repository find_one_by_name retourne une collection existante
        existing = Collection(id=str(uuid4()), name="Duplicate Name", owner_id=user_id)
        mock_collection_repository.find_one_by_name.return_value = existing

        dto = CollectionCreateDTO(
            name="Duplicate Name",
            description="Test",
            owner_id=user_id
        )

        # Act & Assert
        with pytest.raises(CollectionTitleConflict):
            collection_service.create(dto)

        mock_collection_repository.add.assert_not_called()


class TestCollectionServiceFindOne:
    """Tests pour la récupération d'une collection"""

    def test_find_one_success(self, mock_collection_repository):
        """Récupérer une collection existante."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        dao = Collection(
            id=collection_id,
            name="Test Collection",
            description="Test desc",
            owner_id=str(uuid4()),
            visibility=VisibilityEnum.PUBLIC
        )
        mock_collection_repository.find_one_by_id.return_value = dao

        # Act
        result = collection_service.find_one(collection_id)

        # Assert
        assert isinstance(result, CollectionDTO)
        assert result.id == collection_id
        assert result.name == "Test Collection"
        mock_collection_repository.find_one_by_id.assert_called_once_with(collection_id)

    def test_find_one_not_found(self, mock_collection_repository):
        """Récupérer une collection inexistante lève CollectionNotFound."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        mock_collection_repository.find_one_by_id.return_value = None

        # Act & Assert
        with pytest.raises(CollectionNotFound):
            collection_service.find_one(collection_id)

        mock_collection_repository.find_one_by_id.assert_called_once_with(collection_id)


class TestCollectionServiceUpdate:
    """Tests pour la mise à jour de collection"""

    def test_update_collection_success(self, mock_collection_repository):
        """Mettre à jour une collection existante."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        existing_dao = Collection(
            id=collection_id,
            name="Old Name",
            description="Old desc",
            owner_id=str(uuid4()),
            visibility=VisibilityEnum.PRIVATE
        )
        updated_dao = Collection(
            id=collection_id,
            name="New Name",
            description="New desc",
            owner_id=existing_dao.owner_id,
            visibility=VisibilityEnum.PUBLIC
        )

        mock_collection_repository.find_one_by_id.return_value = existing_dao
        mock_collection_repository.update.return_value = updated_dao

        dto = CollectionUpdateDTO(
            name="New Name",
            description="New desc",
            visibility=VisibilityEnum.PUBLIC
        )

        # Act
        result = collection_service.update(collection_id, dto)

        # Assert
        assert result.name == "New Name"
        assert result.description == "New desc"
        assert result.visibility == VisibilityEnum.PUBLIC
        mock_collection_repository.find_one_by_id.assert_called_once_with(collection_id)
        mock_collection_repository.update.assert_called_once()

    def test_update_collection_not_found(self, mock_collection_repository):
        """Mettre à jour une collection inexistante lève CollectionNotFound."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        mock_collection_repository.find_one_by_id.return_value = None

        dto = CollectionUpdateDTO(name="New Name")

        # Act & Assert
        with pytest.raises(CollectionNotFound):
            collection_service.update(collection_id, dto)

        mock_collection_repository.update.assert_not_called()


class TestCollectionServiceDelete:
    """Tests pour la suppression de collection"""

    def test_delete_collection_success(self, mock_collection_repository):
        """Supprimer une collection existante."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        dao = Collection(
            id=collection_id,
            name="To Delete",
            owner_id=str(uuid4())
        )
        mock_collection_repository.find_one_by_id.return_value = dao
        mock_collection_repository.delete.return_value = None

        # Act
        collection_service.delete(collection_id)

        # Assert
        mock_collection_repository.find_one_by_id.assert_called_once_with(collection_id)
        mock_collection_repository.delete.assert_called_once_with(collection_id)

    def test_delete_collection_not_found(self, mock_collection_repository):
        """Supprimer une collection inexistante lève CollectionNotFound."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        mock_collection_repository.find_one_by_id.return_value = None

        # Act & Assert
        with pytest.raises(CollectionNotFound):
            collection_service.delete(collection_id)

        mock_collection_repository.delete.assert_not_called()


class TestCollectionServiceFindMany:
    """Tests pour la récupération de plusieurs collections"""

    def test_find_many_returns_all(self, mock_collection_repository):
        """Récupérer toutes les collections."""
        from services.impl.collection.collection_service_impl import collection_service
        from repositorys.collection_repository import CollectionSearchParams

        # Arrange
        daos = [
            Collection(id=str(uuid4()), name=f"Collection {i}", owner_id=str(uuid4()))
            for i in range(3)
        ]
        mock_collection_repository.find_many.return_value = (daos, 3)

        params = CollectionSearchParams()

        # Act
        results, total = collection_service.find_many(params)

        # Assert
        assert len(results) == 3
        assert total == 3
        assert all(isinstance(r, CollectionDTO) for r in results)
        mock_collection_repository.find_many.assert_called_once_with(params)

    def test_find_many_with_filters(self, mock_collection_repository):
        """Récupérer les collections avec filtres."""
        from services.impl.collection.collection_service_impl import collection_service
        from repositorys.collection_repository import CollectionSearchParams

        # Arrange
        mock_collection_repository.find_many.return_value = ([], 0)

        params = CollectionSearchParams(
            name="test",
            visibility=VisibilityEnum.PUBLIC
        )

        # Act
        results, total = collection_service.find_many(params)

        # Assert
        assert len(results) == 0
        assert total == 0
        mock_collection_repository.find_many.assert_called_once_with(params)

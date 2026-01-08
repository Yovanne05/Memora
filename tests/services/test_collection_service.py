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
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock

from dtos.collection_dto import CollectionCreateDTO, CollectionUpdateDTO, CollectionDTO
from dtos.owner_dto import OwnerDTO
from daos.collection_dao import Collection
from utils.enums import VisibilityEnum
from exceptions.collection_exception import CollectionNotFound
from repositorys.collection_repository import CollectionSearchParams


class TestCollectionServiceCreate:
    """Tests pour la création de collection"""

    def test_create_collection_success(self, mock_collection_repository, monkeypatch):
        """Créer une collection avec des données valides."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        user_id = str(uuid4())
        collection_id = str(uuid4())

        created_dao = Collection(
            id=collection_id,
            name="Test Collection",
            description="Test desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE,
            tags=[],
            notes=[],
            shares=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_collection_repository.add.return_value = created_dao

        mock_dto = CollectionDTO(
            id=collection_id,
            name="Test Collection",
            description="Test desc",
            visibility=VisibilityEnum.PRIVATE,
            owners=[OwnerDTO(user_id=user_id, username="testuser")],
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            notes=[],
            edges=[],
            nodes=[]
        )

        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_to_dto", mock_mapper)

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
        assert len(result.owners) > 0
        assert result.owners[0].user_id == user_id
        mock_collection_repository.add.assert_called_once()


class TestCollectionServiceFindOne:
    """Tests pour la récupération d'une collection"""

    def test_find_one_success(self, mock_collection_repository, monkeypatch):
        """Récupérer une collection existante."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        user_id = str(uuid4())

        mock_user = Mock()
        mock_user.id = user_id
        monkeypatch.setattr("services.impl.collection.collection_service_impl.get_current_user", Mock(return_value=mock_user))

        mock_collection_favorite_repository = Mock()
        mock_collection_favorite_repository.favorite_collection_ids_for_user.return_value = set()
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_favorite_repository", mock_collection_favorite_repository)

        mock_note_favorite_repository = Mock()
        mock_note_favorite_repository.favorite_note_ids_for_user.return_value = set()
        monkeypatch.setattr("services.impl.collection.collection_service_impl.note_favorite_repository", mock_note_favorite_repository)

        dao = Collection(
            id=collection_id,
            name="Test Collection",
            description="Test desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PUBLIC,
            tags=[],
            notes=[],
            shares=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_collection_repository.get_for_user.return_value = dao

        mock_dto = CollectionDTO(
            id=collection_id,
            name="Test Collection",
            description="Test desc",
            visibility=VisibilityEnum.PUBLIC,
            owners=[OwnerDTO(user_id=user_id, username="testuser")],
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            notes=[],
            edges=[],
            nodes=[]
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_to_dto", mock_mapper)

        # Act
        result = collection_service.find_one(collection_id)

        # Assert
        assert isinstance(result, CollectionDTO)
        assert result.id == collection_id
        assert result.name == "Test Collection"
        mock_collection_repository.get_for_user.assert_called_once()

    def test_find_one_not_found(self, mock_collection_repository, monkeypatch):
        """Récupérer une collection inexistante lève CollectionNotFound."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        user_id = str(uuid4())

        mock_user = Mock()
        mock_user.id = user_id
        monkeypatch.setattr("services.impl.collection.collection_service_impl.get_current_user", Mock(return_value=mock_user))

        mock_collection_repository.get_for_user.return_value = None

        # Act & Assert
        with pytest.raises(CollectionNotFound):
            collection_service.find_one(collection_id)

        mock_collection_repository.get_for_user.assert_called_once()


class TestCollectionServiceUpdate:
    """Tests pour la mise à jour de collection"""

    def test_update_collection_success(self, mock_collection_repository, monkeypatch):
        """Mettre à jour une collection existante."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        user_id = str(uuid4())

        existing_dao = Collection(
            id=collection_id,
            name="Old Name",
            description="Old desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE,
            tags=[],
            notes=[],
            shares=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        updated_dao = Collection(
            id=collection_id,
            name="New Name",
            description="New desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PUBLIC,
            tags=[],
            notes=[],
            shares=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        mock_collection_repository.find_one_unscoped.return_value = existing_dao
        mock_collection_repository.update.return_value = updated_dao

        mock_dto = CollectionDTO(
            id=collection_id,
            name="New Name",
            description="New desc",
            visibility=VisibilityEnum.PUBLIC,
            owners=[OwnerDTO(user_id=user_id, username="testuser")],
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            notes=[],
            edges=[],
            nodes=[]
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_to_dto", mock_mapper)

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
        mock_collection_repository.find_one_unscoped.assert_called_once_with(collection_id)
        mock_collection_repository.update.assert_called_once()

    def test_update_collection_not_found(self, mock_collection_repository):
        """Mettre à jour une collection inexistante lève CollectionNotFound."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        mock_collection_repository.find_one_unscoped.return_value = None

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
        mock_collection_repository.delete.return_value = True

        # Act
        collection_service.delete(collection_id)

        # Assert
        mock_collection_repository.delete.assert_called_once_with(collection_id)

    def test_delete_collection_not_found(self, mock_collection_repository):
        """Supprimer une collection inexistante lève CollectionNotFound."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        collection_id = str(uuid4())
        mock_collection_repository.delete.return_value = False

        # Act & Assert
        with pytest.raises(CollectionNotFound):
            collection_service.delete(collection_id)

        mock_collection_repository.delete.assert_called_once_with(collection_id)


class TestCollectionServiceFindMany:
    """Tests pour la récupération de plusieurs collections"""

    def test_find_many_returns_all(self, mock_collection_repository, monkeypatch):
        """Récupérer toutes les collections."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        user_id = str(uuid4())

        mock_user = Mock()
        mock_user.id = user_id
        monkeypatch.setattr("services.impl.collection.collection_service_impl.get_current_user", Mock(return_value=mock_user))

        mock_collection_favorite_repository = Mock()
        mock_collection_favorite_repository.favorite_collection_ids_for_user.return_value = set()
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_favorite_repository", mock_collection_favorite_repository)

        mock_note_favorite_repository = Mock()
        mock_note_favorite_repository.favorite_note_ids_for_user.return_value = set()
        monkeypatch.setattr("services.impl.collection.collection_service_impl.note_favorite_repository", mock_note_favorite_repository)

        daos = [
            Collection(
                id=str(uuid4()),
                name=f"Collection {i}",
                owner_id=user_id,
                tags=[],
                notes=[],
                shares=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            for i in range(3)
        ]
        mock_collection_repository.list_for_user.return_value = (daos, 3)

        mock_dtos = [
            CollectionDTO(
                id=dao.id,
                name=dao.name,
                visibility=VisibilityEnum.PRIVATE,
                owners=[OwnerDTO(user_id=user_id, username="testuser")],
                tags=[],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                notes=[],
                edges=[],
                nodes=[]
            )
            for dao in daos
        ]

        mock_mapper = Mock(side_effect=mock_dtos)
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_to_dto", mock_mapper)

        params = CollectionSearchParams()

        # Act
        results, total = collection_service.find_many(params)

        # Assert
        assert len(results) == 3
        assert total == 3
        assert all(isinstance(r, CollectionDTO) for r in results)
        mock_collection_repository.list_for_user.assert_called_once()

    def test_find_many_with_filters(self, mock_collection_repository, monkeypatch):
        """Récupérer les collections avec filtres."""
        from services.impl.collection.collection_service_impl import collection_service

        # Arrange
        user_id = str(uuid4())

        mock_user = Mock()
        mock_user.id = user_id
        monkeypatch.setattr("services.impl.collection.collection_service_impl.get_current_user", Mock(return_value=mock_user))

        mock_collection_favorite_repository = Mock()
        mock_collection_favorite_repository.favorite_collection_ids_for_user.return_value = set()
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_favorite_repository", mock_collection_favorite_repository)

        mock_note_favorite_repository = Mock()
        mock_note_favorite_repository.favorite_note_ids_for_user.return_value = set()
        monkeypatch.setattr("services.impl.collection.collection_service_impl.note_favorite_repository", mock_note_favorite_repository)

        mock_collection_repository.list_for_user.return_value = ([], 0)

        params = CollectionSearchParams(
            title_contains="test",
            visibility=VisibilityEnum.PUBLIC
        )

        # Act
        results, total = collection_service.find_many(params)

        # Assert
        assert len(results) == 0
        assert total == 0
        mock_collection_repository.list_for_user.assert_called_once()

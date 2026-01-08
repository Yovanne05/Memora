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

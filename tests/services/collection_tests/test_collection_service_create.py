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

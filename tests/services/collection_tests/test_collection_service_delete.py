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
from daos.collection_dao import Collection
from utils.enums import VisibilityEnum
from exceptions.collection_exception import CollectionNotFound
from repositorys.collection_repository import CollectionSearchParams


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

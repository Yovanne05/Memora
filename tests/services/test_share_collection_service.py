"""
Tests pour le service share_collection (logique métier).

Ces tests vérifient :
- Partager une collection avec un utilisateur
- Modifier/révoquer un partage
- Validation des permissions

Les repositories sont MOCKÉS.
"""
import pytest
from uuid import uuid4

from dtos.collection_share_dto import CollectionShareDTO, CollectionShareCreateDTO
from daos.collection_share_dao import CollectionShare
from exceptions.share_collection_exception import CollectionShareNotFound
from utils.enums import PermissionEnum


class TestShareCollectionServiceCreate:
    """Tests pour partager une collection"""

    def test_share_collection_success(self, mock_collection_share_repository, mock_collection_repository, mock_user_repository, monkeypatch):
        """Partager une collection avec un utilisateur."""
        from services.impl.collection.collection_share_service_impl import collection_share_service
        from daos.collection_dao import Collection
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        user_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.collection.collection_share_service_impl.get_current_user", lambda: current_user)

        collection = Collection(id=collection_id, name="Test", owner_id=owner_id)
        mock_collection_repository.find_one_unscoped.return_value = collection

        target_user = User(id=user_id, email="target@example.com", username="target", password_hash="hash", role=RoleEnum.CLIENT)
        mock_user_repository.find_one.return_value = target_user

        mock_collection_share_repository.find_one_by_collection_and_user.return_value = None

        share = CollectionShare(
            id=str(uuid4()),
            collection_id=collection_id,
            user_id=user_id,
            permission=PermissionEnum.READ
        )
        mock_collection_share_repository.add.return_value = share

        dto = CollectionShareCreateDTO(user_id=user_id, permission=PermissionEnum.READ)

        # Act
        result = collection_share_service.share_collection(collection_id, dto)

        # Assert
        assert isinstance(result, CollectionShareDTO)
        assert result.collection_id == collection_id
        assert result.user_id == user_id
        mock_collection_repository.find_one_unscoped.assert_called_once()
        mock_collection_share_repository.add.assert_called_once()


class TestShareCollectionServiceRevoke:
    """Tests pour révoquer un partage"""

    def test_revoke_share_success(self, mock_collection_share_repository, monkeypatch):
        """Révoquer un partage existant."""
        from services.impl.collection.collection_share_service_impl import collection_share_service
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        share_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.collection.collection_share_service_impl.get_current_user", lambda: current_user)

        share = CollectionShare(
            id=share_id,
            collection_id=str(uuid4()),
            user_id=str(uuid4()),
            permission=PermissionEnum.READ
        )
        mock_collection_share_repository.find_one_by_id.return_value = share
        mock_collection_share_repository.delete.return_value = None

        # Act
        collection_share_service.revoke_share(share_id)

        # Assert
        mock_collection_share_repository.find_one_by_id.assert_called_once_with(share_id)
        mock_collection_share_repository.delete.assert_called_once_with(share_id)

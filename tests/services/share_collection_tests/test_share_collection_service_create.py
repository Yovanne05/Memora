"""
Tests pour le service share_collection (logique métier).

Ces tests vérifient :
- Partager une collection avec un utilisateur
- Modifier/révoquer un partage
- Validation des permissions

Les repositories sont MOCKÉS.
"""
from datetime import datetime
from uuid import uuid4
from dtos.collection_share_dto import CollectionShareDTO, CollectionShareCreateDTO
from daos.collection_dao import CollectionShare
from exceptions.share_collection_exception import CollectionShareNotFound
from utils.enums import SharePermissionEnum


class TestShareCollectionServiceCreate:
    """Tests pour partager une collection"""

    def test_share_collection_success(self, mock_collection_share_repository, mock_collection_repository, mock_user_repository, make_collection, make_user, monkeypatch):
        """Partager une collection avec un utilisateur."""
        from services.impl.collection.collection_share_service_impl import collection_share_service
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        user_id = str(uuid4())

        current_user = make_user(
            user_id=owner_id,
            email="owner@example.com",
            username="owner",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.collection.collection_share_service_impl.get_current_user", lambda: current_user)
        monkeypatch.setattr("services.impl.collection.collection_share_service_impl.permission_domain_service.can_write_collection", lambda *args: True)

        collection = make_collection(
            collection_id=collection_id,
            owner_id=owner_id,
            name="Test",
        )
        mock_collection_repository.find_one_unscoped.return_value = collection
        mock_collection_repository.find_one.return_value = collection

        target_user = make_user(
            user_id=user_id,
            email="target@example.com",
            username="target",
            role=RoleEnum.CLIENT,
        )
        mock_user_repository.find_one.return_value = target_user

        mock_collection_share_repository.find_one.return_value = None

        share = CollectionShare(
            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ,
            created_at=datetime.now()
        )
        share.user = target_user  # Attach the user relation
        mock_collection_share_repository.add.return_value = share

        dto = CollectionShareCreateDTO(user_id=user_id, permission=SharePermissionEnum.READ)

        # Act
        result = collection_share_service.share_collection(collection_id, dto)

        # Assert
        assert isinstance(result, CollectionShareDTO)
        assert result.collection_id == collection_id
        assert result.user.id == user_id
        mock_collection_repository.find_one_unscoped.assert_called_once()
        mock_collection_share_repository.add.assert_called_once()

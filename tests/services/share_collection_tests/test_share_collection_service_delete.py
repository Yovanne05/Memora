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


class TestShareCollectionServiceRevoke:
    """Tests pour révoquer un partage"""

    def test_revoke_share_success(self, mock_collection_share_repository, mock_collection_repository, make_collection, make_user, monkeypatch):
        """Révoquer un partage existant."""
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
        mock_collection_repository.find_one.return_value = collection

        share = CollectionShare(
            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ,
            created_at=datetime.now()
        )
        mock_collection_share_repository.find_one_by_collection_and_user.return_value = share
        mock_collection_share_repository.delete.return_value = True

        # Act
        collection_share_service.revoke_share(collection_id, user_id)

        # Assert
        mock_collection_share_repository.delete.assert_called_once_with(collection_id, user_id)

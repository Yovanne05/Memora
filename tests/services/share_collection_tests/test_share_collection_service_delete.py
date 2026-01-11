"""
Tests pour le service share_collection (logique métier).

Ces tests vérifient :
- Partager une collection avec un utilisateur
- Modifier/révoquer un partage
- Validation des permissions

Les repositories sont MOCKÉS.
"""
from uuid import uuid4
from datetime import datetime
from dtos.collection_share_dto import CollectionShareDTO, CollectionShareCreateDTO
from daos.collection_dao import CollectionShare
from exceptions.share_collection_exception import CollectionShareNotFound
from utils.enums import SharePermissionEnum


class TestShareCollectionServiceRevoke:
    """Tests pour révoquer un partage"""

    def test_revoke_share_success(self, mock_collection_share_repository, mock_collection_repository, monkeypatch):
        """Révoquer un partage existant."""
        from services.impl.collection.collection_share_service_impl import collection_share_service
        from daos.collection_dao import Collection
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        user_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now())
        monkeypatch.setattr("services.impl.collection.collection_share_service_impl.get_current_user", lambda: current_user)
        monkeypatch.setattr("services.impl.collection.collection_share_service_impl.permission_domain_service.can_write_collection", lambda *args: True)

        collection = Collection(id=collection_id, name="Test", owner_id=owner_id, tags=[], notes=[], shares=[], created_at=datetime.now(), updated_at=datetime.now())
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

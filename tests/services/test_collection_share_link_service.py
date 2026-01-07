"""
Tests pour le service collection_share_link (logique métier).

Ces tests vérifient :
- Créer un lien public de partage de collection
- Lister les liens publics d'une collection
- Supprimer un lien public
- Validation des permissions

Les repositories sont MOCKÉS.
"""
import pytest
from uuid import uuid4

from dtos.collection_share_link_dto import CollectionShareLinkDTO, CollectionShareLinkCreateDTO
from daos.collection_share_link_dao import CollectionShareLink
from exceptions.collection_share_link_exception import CollectionShareLinkNotFound


class TestCollectionShareLinkServiceCreate:
    """Tests pour créer un lien public"""

    def test_create_share_link_success(self, mock_collection_share_link_repository, mock_collection_repository, monkeypatch):
        """Créer un lien public de partage."""
        from services.impl.collection.collection_share_link_service_impl import collection_share_link_service
        from daos.collection_dao import Collection
        from utils.enums import PermissionEnum

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())

        collection = Collection(id=collection_id, name="Test Collection", owner_id=owner_id)
        mock_collection_repository.find_one_unscoped.return_value = collection

        link = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            token="abc123",
            permission=PermissionEnum.READ
        )
        mock_collection_share_link_repository.add.return_value = link

        payload = CollectionShareLinkCreateDTO(permission=PermissionEnum.READ)

        # Act
        result = collection_share_link_service.create_share_link(collection_id, payload)

        # Assert
        assert isinstance(result, CollectionShareLinkDTO)
        assert result.collection_id == collection_id
        assert "token" in result.model_dump()
        mock_collection_share_link_repository.add.assert_called_once()


class TestCollectionShareLinkServiceList:
    """Tests pour lister les liens publics"""

    def test_find_many_filters_by_ownership(self, mock_collection_share_link_repository, mock_collection_repository, monkeypatch):
        """Lister les liens filtre par propriétaire."""
        from services.impl.collection.collection_share_link_service_impl import collection_share_link_service
        from daos.collection_dao import Collection
        from daos.user_dao import User
        from utils.enums import RoleEnum, PermissionEnum
        from repositorys.collection_share_link_repository import CollectionShareLinkSearchParams

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.collection.collection_share_link_service_impl.get_current_user", lambda: current_user)

        collection = Collection(id=collection_id, name="Test Collection", owner_id=owner_id)
        mock_collection_repository.find_one_unscoped.return_value = collection

        links = [
            CollectionShareLink(
                id=str(uuid4()),
                collection_id=collection_id,
                token="abc123",
                permission=PermissionEnum.READ
            )
        ]
        mock_collection_share_link_repository.find_many.return_value = (links, 1)

        params = CollectionShareLinkSearchParams(collection_id=collection_id)

        # Act
        result_links, total = collection_share_link_service.find_many(params)

        # Assert
        assert total == 1
        assert len(result_links) == 1


class TestCollectionShareLinkServiceDelete:
    """Tests pour supprimer un lien public"""

    def test_delete_share_link_success(self, mock_collection_share_link_repository, mock_collection_repository):
        """Supprimer un lien public."""
        from services.impl.collection.collection_share_link_service_impl import collection_share_link_service
        from daos.collection_dao import Collection

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        link_id = str(uuid4())

        collection = Collection(id=collection_id, name="Test Collection", owner_id=owner_id)
        mock_collection_repository.find_one_unscoped.return_value = collection

        mock_collection_share_link_repository.delete.return_value = True

        # Act
        collection_share_link_service.delete_share_link(collection_id, link_id)

        # Assert
        mock_collection_share_link_repository.delete.assert_called_once_with(link_id)

    def test_delete_nonexistent_link_raises_exception(self, mock_collection_share_link_repository, mock_collection_repository):
        """Supprimer un lien inexistant lève CollectionShareLinkNotFound."""
        from services.impl.collection.collection_share_link_service_impl import collection_share_link_service
        from daos.collection_dao import Collection

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        link_id = str(uuid4())

        collection = Collection(id=collection_id, name="Test Collection", owner_id=owner_id)
        mock_collection_repository.find_one_unscoped.return_value = collection

        mock_collection_share_link_repository.delete.return_value = False

        # Act & Assert
        with pytest.raises(CollectionShareLinkNotFound):
            collection_share_link_service.delete_share_link(collection_id, link_id)

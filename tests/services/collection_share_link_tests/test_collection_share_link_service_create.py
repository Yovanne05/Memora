"""
Tests pour le service collection_share_link (logique métier).

Ces tests vérifient :
- Créer un lien public de partage de collection
- Lister les liens publics d'une collection
- Supprimer un lien public
- Validation des permissions

Les repositories sont MOCKÉS.
"""
from uuid import uuid4
from datetime import datetime
from dtos.collection_share_link_dto import CollectionShareLinkDTO, CollectionShareLinkCreateDTO
from daos.collection_share_link_dao import CollectionShareLink
from exceptions.collection_share_link_exception import CollectionShareLinkNotFound


class TestCollectionShareLinkServiceCreate:
    """Tests pour créer un lien public"""

    def test_create_share_link_success(self, mock_collection_share_link_repository, mock_collection_repository, monkeypatch):
        """Créer un lien public de partage."""
        from services.impl.collection.collection_share_link_service_impl import collection_share_link_service
        from daos.collection_dao import Collection
        from utils.enums import SharePermissionEnum

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())

        collection = Collection(
            id=collection_id, name="Test Collection", owner_id=owner_id,
            tags=[], notes=[], shares=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_collection_repository.find_one_unscoped.return_value = collection

        link = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            permission=SharePermissionEnum.READ,
            created_at=datetime.now()
        )
        mock_collection_share_link_repository.add.return_value = link

        payload = CollectionShareLinkCreateDTO(permission=SharePermissionEnum.READ)

        # Act
        result = collection_share_link_service.create_share_link(collection_id, payload)

        # Assert
        assert isinstance(result, CollectionShareLinkDTO)
        assert result.collection_id == collection_id
        mock_collection_share_link_repository.add.assert_called_once()

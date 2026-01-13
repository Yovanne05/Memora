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
from datetime import datetime
from exceptions.collection_share_link_exception import CollectionShareLinkNotFound


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

        collection = Collection(
            id=collection_id, name="Test Collection", owner_id=owner_id,
            tags=[], notes=[], shares=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
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

        collection = Collection(
            id=collection_id, name="Test Collection", owner_id=owner_id,
            tags=[], notes=[], shares=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_collection_repository.find_one_unscoped.return_value = collection

        mock_collection_share_link_repository.delete.return_value = False

        # Act & Assert
        with pytest.raises(CollectionShareLinkNotFound):
            collection_share_link_service.delete_share_link(collection_id, link_id)

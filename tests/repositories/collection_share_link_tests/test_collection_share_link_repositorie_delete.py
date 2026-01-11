"""
Tests pour la suppression de lien de partage de collection (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.collection_share_link_dao import CollectionShareLink
from repositorys import collection_share_link_repository
from utils.enums import SharePermissionEnum


class TestCollectionShareLinkRepositoryDelete:
    """Tests pour supprimer un lien"""

    def test_delete_share_link_success(self, test_factory):
        """Supprimer un lien de partage."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        link = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            permission=SharePermissionEnum.READ
        )
        added = collection_share_link_repository.add(link)

        # Act
        deleted = collection_share_link_repository.delete(added.id)

        # Assert
        assert deleted is True
        result = collection_share_link_repository.find_one(added.id)
        assert result is None

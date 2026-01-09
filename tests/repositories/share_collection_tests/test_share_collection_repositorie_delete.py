"""
Tests pour la suppression de partage de collection (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from daos.collection_dao import CollectionShare
from repositorys import collection_share_repository
from utils.enums import SharePermissionEnum


class TestCollectionShareRepositoryDelete:
    """Tests pour supprimer un partage"""

    def test_delete_share_success(self, test_factory):
        """Supprimer un partage de collection."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        share = CollectionShare(

            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )
        added = collection_share_repository.add(share)

        # Act
        collection_share_repository.delete(collection_id, user_id)

        # Assert
        result = collection_share_repository.find_one(collection_id, user_id)
        assert result is None

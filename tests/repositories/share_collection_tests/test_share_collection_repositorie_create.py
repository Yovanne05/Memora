"""
Tests pour l'ajout de partage de collection (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from daos.collection_dao import CollectionShare
from repositorys import collection_share_repository
from utils.enums import SharePermissionEnum


class TestCollectionShareRepositoryAdd:
    """Tests pour ajouter un partage"""

    def test_add_share_success(self, test_factory):
        """Ajouter un partage de collection."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        share = CollectionShare(
            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )

        # Act
        result = collection_share_repository.add(share)

        # Assert
        # assert result has composite key
        assert result.collection_id == collection_id
        assert result.user_id == user_id
        assert result.permission == SharePermissionEnum.READ

"""
Tests pour le repository collection_share_link (accès base de données).

Ces tests vérifient :
- Ajouter un lien de partage public
- Récupérer un lien par ID
- Lister les liens par collection
- Supprimer un lien

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from uuid import uuid4

from daos.collection_share_link_dao import CollectionShareLink
from repositorys import collection_share_link_repository
from utils.enums import PermissionEnum


class TestCollectionShareLinkRepositoryAdd:
    """Tests pour ajouter un lien"""

    def test_add_share_link_success(self, test_factory):
        """Ajouter un lien de partage public."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        link = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            token="abc123xyz",
            permission=PermissionEnum.READ
        )

        # Act
        result = collection_share_link_repository.add(link)

        # Assert
        assert result.id is not None
        assert result.collection_id == collection_id
        assert result.token == "abc123xyz"
        assert result.permission == PermissionEnum.READ


class TestCollectionShareLinkRepositoryFind:
    """Tests pour récupérer un lien"""

    def test_find_one_by_id(self, test_factory):
        """Récupérer un lien par ID."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        link = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            token="test-token",
            permission=PermissionEnum.READ
        )
        added = collection_share_link_repository.add(link)

        # Act
        result = collection_share_link_repository.find_one(added.id)

        # Assert
        assert result is not None
        assert result.id == added.id
        assert result.token == "test-token"

    def test_find_one_by_token(self, test_factory):
        """Récupérer un lien par token."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        link = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            token="unique-token",
            permission=PermissionEnum.WRITE
        )
        collection_share_link_repository.add(link)

        # Act
        result = collection_share_link_repository.find_by_token("unique-token")

        # Assert
        assert result is not None
        assert result.token == "unique-token"
        assert result.collection_id == collection_id


class TestCollectionShareLinkRepositoryList:
    """Tests pour lister les liens"""

    def test_find_many_filters_by_collection_id(self, test_factory):
        """Lister les liens filtre par collection_id."""
        from repositorys.collection_share_link_repository import CollectionShareLinkSearchParams

        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        link1 = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            token="token1",
            permission=PermissionEnum.READ
        )
        link2 = CollectionShareLink(
            id=str(uuid4()),
            collection_id=collection_id,
            token="token2",
            permission=PermissionEnum.WRITE
        )
        collection_share_link_repository.add(link1)
        collection_share_link_repository.add(link2)

        params = CollectionShareLinkSearchParams(collection_id=collection_id)

        # Act
        links, total = collection_share_link_repository.find_many(params)

        # Assert
        assert total == 2
        assert len(links) == 2
        assert all(link.collection_id == collection_id for link in links)


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
            token="to-delete",
            permission=PermissionEnum.READ
        )
        added = collection_share_link_repository.add(link)

        # Act
        deleted = collection_share_link_repository.delete(added.id)

        # Assert
        assert deleted is True
        result = collection_share_link_repository.find_one(added.id)
        assert result is None

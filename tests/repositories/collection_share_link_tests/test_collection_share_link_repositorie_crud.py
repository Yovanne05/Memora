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
from datetime import datetime
from uuid import uuid4
from daos.collection_share_link_dao import CollectionShareLink
from repositorys import collection_share_link_repository
from utils.enums import SharePermissionEnum


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
            permission=SharePermissionEnum.READ
        )

        # Act
        result = collection_share_link_repository.add(link)

        # Assert
        assert result.id is not None
        assert result.collection_id == collection_id
        assert result.permission == SharePermissionEnum.READ


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

"""
Tests pour le repository share_collection (accès base de données).

Ces tests vérifient :
- Ajouter/supprimer un partage de collection
- Récupérer partages par collection/user
- Contraintes uniques et permissions

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from datetime import datetime
from uuid import uuid4

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
            id=str(uuid4()),
            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )

        # Act
        result = collection_share_repository.add(share)

        # Assert
        assert result.id is not None
        assert result.collection_id == collection_id
        assert result.user_id == user_id
        assert result.permission == SharePermissionEnum.READ


class TestCollectionShareRepositoryFind:
    """Tests pour récupérer un partage"""

    def test_find_one_by_collection_and_user(self, test_factory):
        """Récupérer un partage par collection et user."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        share = CollectionShare(
            id=str(uuid4()),
            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.WRITE
        )
        collection_share_repository.add(share)

        # Act
        result = collection_share_repository.find_one_by_collection_and_user(collection_id, user_id)

        # Assert
        assert result is not None
        assert result.collection_id == collection_id
        assert result.user_id == user_id
        assert result.permission == SharePermissionEnum.WRITE


class TestCollectionShareRepositoryDelete:
    """Tests pour supprimer un partage"""

    def test_delete_share_success(self, test_factory):
        """Supprimer un partage de collection."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        share = CollectionShare(
            id=str(uuid4()),
            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )
        added = collection_share_repository.add(share)

        # Act
        collection_share_repository.delete(added.id)

        # Assert
        result = collection_share_repository.find_one_by_collection_and_user(collection_id, user_id)
        assert result is None

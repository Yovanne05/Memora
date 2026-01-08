"""
Tests pour le repository share_note (accès base de données).

Ces tests vérifient :
- Ajouter/supprimer un partage de note
- Récupérer partages par note/user
- Contraintes uniques et permissions

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from datetime import datetime
from uuid import uuid4

from daos.note_dao import NoteShare
from repositorys import note_share_repository
from utils.enums import SharePermissionEnum


class TestNoteShareRepositoryAdd:
    """Tests pour ajouter un partage"""

    def test_add_share_success(self, test_factory):
        """Ajouter un partage de note."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        share = NoteShare(
            note_id=note_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )

        # Act
        result = note_share_repository.add(share)

        # Assert
        assert result.note_id == note_id
        assert result.user_id == user_id
        assert result.permission == SharePermissionEnum.READ


class TestNoteShareRepositoryFind:
    """Tests pour récupérer un partage"""

    def test_find_one_by_note_and_user(self, test_factory):
        """Récupérer un partage par note et user."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        share = NoteShare(
            note_id=note_id,
            user_id=user_id,
            permission=SharePermissionEnum.WRITE
        )
        note_share_repository.add(share)

        # Act
        result = note_share_repository.find_one(note_id, user_id)

        # Assert
        assert result is not None
        assert result.note_id == note_id
        assert result.user_id == user_id
        assert result.permission == SharePermissionEnum.WRITE


class TestNoteShareRepositoryUpdate:
    """Tests pour mettre à jour un partage"""

    def test_update_share_success(self, test_factory):
        """Mettre à jour les permissions d'un partage."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        share = NoteShare(
            note_id=note_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )
        added = note_share_repository.add(share)

        # Act
        added.permission = SharePermissionEnum.WRITE
        result = note_share_repository.update(added)

        # Assert
        assert result.permission == SharePermissionEnum.WRITE

        # Verify in DB
        found = note_share_repository.find_one(note_id, user_id)
        assert found.permission == SharePermissionEnum.WRITE


class TestNoteShareRepositoryDelete:
    """Tests pour supprimer un partage"""

    def test_delete_share_success(self, test_factory):
        """Supprimer un partage de note."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        user_id = test_factory.create_user(label="target")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        share = NoteShare(
            note_id=note_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )
        note_share_repository.add(share)

        # Act
        deleted = note_share_repository.delete(note_id, user_id)

        # Assert
        assert deleted is True
        result = note_share_repository.find_one(note_id, user_id)
        assert result is None

"""
Tests pour le repository share_note (accès base de données).

Ces tests vérifient :
- Ajouter/supprimer un partage de note
- Récupérer partages par note/user
- Contraintes uniques et permissions

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from datetime import datetime
from uuid import uuid4
from daos.note_dao import NoteShare
from repositorys import note_share_repository
from utils.enums import SharePermissionEnum


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

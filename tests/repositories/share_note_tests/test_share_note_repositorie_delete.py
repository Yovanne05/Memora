"""
Tests pour la suppression de partage de note (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from daos.note_dao import NoteShare
from repositorys import note_share_repository
from utils.enums import SharePermissionEnum


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

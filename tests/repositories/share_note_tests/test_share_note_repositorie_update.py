"""
Tests pour la mise à jour de partage de note (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from daos.note_dao import NoteShare
from repositorys import note_share_repository
from utils.enums import SharePermissionEnum


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

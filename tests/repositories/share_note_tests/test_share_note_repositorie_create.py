"""
Tests pour l'ajout de partage de note (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
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

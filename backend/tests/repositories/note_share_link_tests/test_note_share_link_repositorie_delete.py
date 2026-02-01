"""
Tests pour la suppression de lien de partage de note (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.note_share_link_dao import NoteShareLink
from repositorys import note_share_link_repository
from utils.enums import SharePermissionEnum


class TestNoteShareLinkRepositoryDelete:
    """Tests pour supprimer un lien"""

    def test_delete_share_link_success(self, test_factory):
        """Supprimer un lien de partage."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ
        )
        added = note_share_link_repository.add(link)

        # Act
        deleted = note_share_link_repository.delete(added.id)

        # Assert
        assert deleted is True
        result = note_share_link_repository.find_one(added.id)
        assert result is None

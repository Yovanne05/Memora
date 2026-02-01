"""
Tests pour l'ajout de lien de partage de note (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.note_share_link_dao import NoteShareLink
from repositorys import note_share_link_repository
from utils.enums import SharePermissionEnum


class TestNoteShareLinkRepositoryAdd:
    """Tests pour ajouter un lien"""

    def test_add_share_link_success(self, test_factory):
        """Ajouter un lien de partage public."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ
        )

        # Act
        result = note_share_link_repository.add(link)

        # Assert
        assert result.id is not None
        assert result.note_id == note_id
        assert result.permission == SharePermissionEnum.READ

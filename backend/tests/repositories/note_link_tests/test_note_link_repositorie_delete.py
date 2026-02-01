"""
Tests pour la suppression de lien entre notes (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from daos.note_dao import NoteLink
from repositorys import note_link_repository


class TestNoteLinkRepositoryDelete:
    """Tests pour supprimer un lien"""

    def test_delete_note_link_success(self, test_factory):
        """Supprimer un lien entre notes."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id_1 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 1")
        note_id_2 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 2")

        link = NoteLink(note_id_1=note_id_1, note_id_2=note_id_2, label="Test Link")
        note_link_repository.add(link)

        # Act
        note_link_repository.delete(note_id_1, note_id_2)

        # Assert
        result = note_link_repository.find_one(note_id_1, note_id_2)
        assert result is None

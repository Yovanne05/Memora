"""
Tests pour l'ajout de lien entre notes (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from daos.note_dao import NoteLink
from repositorys import note_link_repository


class TestNoteLinkRepositoryAdd:
    """Tests pour ajouter un lien"""

    def test_add_note_link_success(self, test_factory):
        """Ajouter un lien entre deux notes."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id_1 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 1")
        note_id_2 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 2")

        link = NoteLink(
            note_id_1=note_id_1,
            note_id_2=note_id_2
        )

        # Act
        result = note_link_repository.add(link)

        # Assert
        # IDs are normalized (sorted), so check both are present
        assert {result.note_id_1, result.note_id_2} == {note_id_1, note_id_2}

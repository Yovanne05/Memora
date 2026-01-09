"""
Tests pour la mise à jour de note (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from repositorys import note_repository


class TestNoteRepositoryUpdate:
    """Tests pour la mise à jour de note"""

    def test_update_note_success(self, test_factory):
        """Mettre à jour une note."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Old Title")

        # Act
        note = note_repository.find_one_unscoped(note_id)
        note.title = "New Title"
        note.content = "test_snapshot_data"
        result = note_repository.update(note)

        # Assert
        assert result.title == "New Title"
        assert result.content == "test_snapshot_data"

        # Vérifier en base
        updated = note_repository.find_one_unscoped(note_id)
        assert updated.title == "New Title"
        assert updated.content == "test_snapshot_data"

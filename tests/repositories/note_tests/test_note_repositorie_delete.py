"""
Tests pour la suppression de note (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from repositorys import note_repository


class TestNoteRepositoryDelete:
    """Tests pour la suppression de note"""

    def test_delete_note_success(self, test_factory):
        """Supprimer une note."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="To Delete")

        # Act
        note_repository.delete(note_id)

        # Assert
        result = note_repository.find_one_unscoped(note_id)
        assert result is None

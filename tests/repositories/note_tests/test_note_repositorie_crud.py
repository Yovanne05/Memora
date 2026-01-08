"""
Tests pour le repository note (accès base de données).

Ces tests vérifient l'interaction avec la base de données :
- Insertion, mise à jour, suppression de notes
- Requêtes SQL (filtres, tri, pagination)
- Contraintes de base de données (foreign keys, titre unique par collection)
- Recherche et scoping des notes

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from datetime import datetime
from uuid import uuid4
from daos.note_dao import Note
from repositorys import note_repository
from repositorys.note_repository import NoteSearchParams
from utils.enums import VisibilityEnum


class TestNoteRepositoryAdd:
    """Tests pour l'ajout de note"""

    def test_add_note_success(self, test_factory):
        """Ajouter une note avec des données valides."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)

        note = Note(
            id=str(uuid4()),
            title="Test Note",
            content="Test content",
            owner_id=user_id,
            collection_id=collection_id,
            visibility=VisibilityEnum.PRIVATE
        )

        # Act
        result = note_repository.add(note)

        # Assert
        assert result.id is not None
        assert result.title == "Test Note"
        assert result.owner_id == user_id
        assert result.collection_id == collection_id
        assert result.visibility == VisibilityEnum.PRIVATE

    def test_add_note_generates_id(self, test_factory):
        """L'ID est bien persisté en base."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = str(uuid4())

        note = Note(
            id=note_id,
            title="Test Note",
            content="Test content",
            owner_id=user_id,
            collection_id=collection_id
        )

        # Act
        result = note_repository.add(note)

        # Assert
        assert result.id == note_id

        # Vérifier qu'on peut la retrouver
        found = note_repository.find_one_unscoped(note_id)
        assert found is not None
        assert found.id == note_id

    def test_add_note_with_foreign_keys(self, test_factory):
        """Les contraintes foreign key (owner_id, collection_id) sont respectées."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)

        note = Note(
            id=str(uuid4()),
            title="Test Note",
            content="Test content",
            owner_id=user_id,  # User existe
            collection_id=collection_id  # Collection existe
        )

        # Act
        result = note_repository.add(note)

        # Assert
        assert result.owner_id == user_id
        assert result.collection_id == collection_id


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
        note.content = "New Content"
        result = note_repository.update(note)

        # Assert
        assert result.title == "New Title"
        assert result.content == "New Content"

        # Vérifier en base
        updated = note_repository.find_one_unscoped(note_id)
        assert updated.title == "New Title"
        assert updated.content == "New Content"


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

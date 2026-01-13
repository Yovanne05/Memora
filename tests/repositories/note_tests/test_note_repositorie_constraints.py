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
from uuid import uuid4
from daos.note_dao import Note
from repositorys import note_repository


class TestNoteRepositoryConstraints:
    """Tests pour les contraintes de base de données"""

    def test_unique_title_per_collection(self, test_factory):
        """Le titre de note doit être unique par collection."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Duplicate Title")

        # Act & Assert
        # Essayer de créer une note avec le même titre dans la même collection
        with pytest.raises(Exception):  # IntegrityError ou équivalent
            note = Note(
                id=str(uuid4()),
                title="Duplicate Title",
                owner_id=user_id,
                collection_id=collection_id
            )
            note_repository.add(note)

    def test_different_collections_can_have_same_title(self, test_factory):
        """Deux collections différentes peuvent avoir des notes avec le même titre."""
        # Arrange
        user_id = test_factory.create_user()
        collection1_id = test_factory.create_collection(owner_id=user_id, name="Collection 1")
        collection2_id = test_factory.create_collection(owner_id=user_id, name="Collection 2")

        # Act
        note1_id = test_factory.create_note(owner_id=user_id, collection_id=collection1_id, title="Same Title")
        note2_id = test_factory.create_note(owner_id=user_id, collection_id=collection2_id, title="Same Title")

        # Assert
        assert note1_id != note2_id

        note1 = note_repository.find_one_unscoped(note1_id)
        note2 = note_repository.find_one_unscoped(note2_id)

        assert note1.title == note2.title == "Same Title"
        assert note1.collection_id != note2.collection_id

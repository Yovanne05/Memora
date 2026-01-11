"""
Tests pour le repository note_link (accès base de données).

Ces tests vérifient :
- Ajouter un lien entre notes
- Récupérer un lien
- Lister les liens d'une note
- Supprimer un lien

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from datetime import datetime
from uuid import uuid4
from daos.note_dao import NoteLink
from repositorys import note_link_repository


class TestNoteLinkRepositoryFind:
    """Tests pour récupérer un lien"""

    def test_find_one_by_note_ids(self, test_factory):
        """Récupérer un lien par note_id_1 et note_id_2."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id_1 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 1")
        note_id_2 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 2")

        link = NoteLink(
            note_id_1=note_id_1,
            note_id_2=note_id_2,
            label="Test Link"
        )
        note_link_repository.add(link)

        # Act
        result = note_link_repository.find_one(note_id_1, note_id_2)

        # Assert
        assert result is not None
        # IDs are normalized (sorted), so check both are present
        assert {result.note_id_1, result.note_id_2} == {note_id_1, note_id_2}


class TestNoteLinkRepositoryList:
    """Tests pour lister les liens"""

    def test_find_many_filters_by_note_id(self, test_factory):
        """Lister les liens filtre par note_id."""
        from repositorys.note_link_repository import NoteLinkSearchParams

        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id_1 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 1")
        note_id_2 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 2")
        note_id_3 = test_factory.create_note(owner_id=owner_id, collection_id=collection_id, title="Note 3")

        link1 = NoteLink(note_id_1=note_id_1, note_id_2=note_id_2, label="Link 1")
        link2 = NoteLink(note_id_1=note_id_1, note_id_2=note_id_3, label="Link 2")
        note_link_repository.add(link1)
        note_link_repository.add(link2)

        params = NoteLinkSearchParams(note_id=note_id_1)

        # Act
        links, total = note_link_repository.find_many(params)

        # Assert
        assert total == 2
        assert len(links) == 2

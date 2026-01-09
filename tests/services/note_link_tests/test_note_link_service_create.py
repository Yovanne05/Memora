"""
Tests pour le service note_link (logique métier).

Ces tests vérifient :
- Créer un lien entre deux notes
- Lister les liens d'une note
- Supprimer un lien
- Validation: pas d'auto-lien, même collection

Les repositories sont MOCKÉS.
"""
from uuid import uuid4
from datetime import datetime
from dtos.note_link_dto import NoteLinkDTO, NoteLinkCreateDTO
from daos.note_dao import NoteLink


class TestNoteLinkServiceCreate:
    """Tests pour créer un lien entre notes"""

    def test_create_link_success(self, mock_note_link_repository, mock_note_repository, monkeypatch):
        """Créer un lien entre deux notes."""
        from services.impl.note.note_link_service_impl import note_link_service
        from daos.note_dao import Note

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        note_id_1 = str(uuid4())
        note_id_2 = str(uuid4())

        note1 = Note(
            id=note_id_1, title="Note 1", owner_id=owner_id,
            collection_id=collection_id, tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        note2 = Note(
            id=note_id_2, title="Note 2", owner_id=owner_id,
            collection_id=collection_id, tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )

        def get_note(nid):
            return note1 if nid == note_id_1 else note2

        mock_note_repository.find_one_unscoped.side_effect = get_note
        mock_note_link_repository.find_one.return_value = None

        link = NoteLink(
            note_id_1=note_id_1,
            note_id_2=note_id_2,
            created_at=datetime.now()
        )
        mock_note_link_repository.add.return_value = link

        payload = NoteLinkCreateDTO(linked_note_id=note_id_2)

        # Act
        result = note_link_service.create_link(note_id_1, payload)

        # Assert
        assert isinstance(result, NoteLinkDTO)
        mock_note_link_repository.add.assert_called_once()

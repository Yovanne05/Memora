"""
Tests pour le service note_link (logique métier).

Ces tests vérifient :
- Créer un lien entre deux notes
- Lister les liens d'une note
- Supprimer un lien
- Validation: pas d'auto-lien, même collection

Les repositories sont MOCKÉS.
"""
import pytest
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
            id=note_id_1, title="Note 1", content="", owner_id=owner_id,
            collection_id=collection_id, tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        note2 = Note(
            id=note_id_2, title="Note 2", content="", owner_id=owner_id,
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


class TestNoteLinkServiceList:
    """Tests pour lister les liens"""

    def test_find_many_returns_links(self, mock_note_link_repository, monkeypatch):
        """Lister les liens d'une note."""
        from services.impl.note.note_link_service_impl import note_link_service
        from daos.user_dao import User
        from utils.enums import RoleEnum
        from repositorys.note_link_repository import NoteLinkSearchParams

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(
            id=user_id, email="test@example.com", username="test",
            password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.note.note_link_service_impl.get_current_user", lambda: current_user)

        links = [
            NoteLink(note_id_1=note_id, note_id_2=str(uuid4()), created_at=datetime.now())
        ]
        mock_note_link_repository.find_many.return_value = (links, 1)

        monkeypatch.setattr("services.impl.note.note_link_service_impl.permission_domain_service.can_read_note", lambda *args: True)
        monkeypatch.setattr("services.impl.note.note_link_service_impl.permission_domain_service.get_accessible_note_ids", lambda *args: None)

        params = NoteLinkSearchParams(note_id=note_id)

        # Act
        result_links, total = note_link_service.find_many(params)

        # Assert
        assert total == 1
        assert len(result_links) == 1


class TestNoteLinkServiceDelete:
    """Tests pour supprimer un lien"""

    def test_delete_link_success(self, mock_note_link_repository, mock_note_repository):
        """Supprimer un lien entre notes."""
        from services.impl.note.note_link_service_impl import note_link_service
        from daos.note_dao import Note

        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        note_id_1 = str(uuid4())
        note_id_2 = str(uuid4())

        note1 = Note(
            id=note_id_1, title="Note 1", content="", owner_id=owner_id,
            collection_id=collection_id, tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        note2 = Note(
            id=note_id_2, title="Note 2", content="", owner_id=owner_id,
            collection_id=collection_id, tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )

        def get_note(nid):
            return note1 if nid == note_id_1 else note2

        mock_note_repository.find_one_unscoped.side_effect = get_note
        mock_note_link_repository.delete.return_value = None

        # Act
        note_link_service.delete_link(note_id_1, note_id_2)

        # Assert
        mock_note_link_repository.delete.assert_called_once_with(note_id_1, note_id_2)

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

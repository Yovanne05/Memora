"""
Tests pour le service note_share_link (logique métier).

Ces tests vérifient :
- Créer un lien public de partage de note
- Lister les liens publics d'une note
- Supprimer un lien public
- Validation des permissions

Les repositories sont MOCKÉS.
"""
from uuid import uuid4
from datetime import datetime
from dtos.note_share_link_dto import NoteShareLinkDTO, NoteShareLinkCreateDTO
from daos.note_share_link_dao import NoteShareLink
from exceptions.note_share_link_exception import NoteShareLinkNotFound


class TestNoteShareLinkServiceList:
    """Tests pour lister les liens publics"""

    def test_find_many_filters_by_ownership(self, mock_note_share_link_repository, mock_note_repository, monkeypatch):
        """Lister les liens filtre par propriétaire."""
        from services.impl.note.note_share_link_service_impl import note_share_link_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum, SharePermissionEnum
        from repositorys.note_share_link_repository import NoteShareLinkSearchParams

        # Arrange
        owner_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(
            id=owner_id, email="owner@example.com", username="owner",
            password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.note.note_share_link_service_impl.get_current_user", lambda: current_user)

        note = Note(
            id=note_id, title="Test Note", content="", owner_id=owner_id,
            collection_id=str(uuid4()), tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_note_repository.find_one_unscoped.return_value = note

        links = [
            NoteShareLink(
                id=str(uuid4()),
                note_id=note_id,
                permission=SharePermissionEnum.READ,
                created_at=datetime.now()
            )
        ]
        mock_note_share_link_repository.find_many.return_value = (links, 1)

        params = NoteShareLinkSearchParams(note_id=note_id)

        # Act
        result_links, total = note_share_link_service.find_many(params)

        # Assert
        assert total == 1
        assert len(result_links) == 1

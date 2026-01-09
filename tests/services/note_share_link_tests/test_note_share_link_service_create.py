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


class TestNoteShareLinkServiceCreate:
    """Tests pour créer un lien public"""

    def test_create_share_link_success(self, mock_note_share_link_repository, mock_note_repository, monkeypatch):
        """Créer un lien public de partage."""
        from services.impl.note.note_share_link_service_impl import note_share_link_service
        from daos.note_dao import Note
        from utils.enums import SharePermissionEnum

        # Arrange
        owner_id = str(uuid4())
        note_id = str(uuid4())

        note = Note(
            id=note_id, title="Test Note", content="", owner_id=owner_id,
            collection_id=str(uuid4()), tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_note_repository.find_one_unscoped.return_value = note

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ,
            created_at=datetime.now()
        )
        mock_note_share_link_repository.add.return_value = link

        payload = NoteShareLinkCreateDTO(permission=SharePermissionEnum.READ)

        # Act
        result = note_share_link_service.create_share_link(note_id, payload)

        # Assert
        assert isinstance(result, NoteShareLinkDTO)
        assert result.note_id == note_id
        mock_note_share_link_repository.add.assert_called_once()

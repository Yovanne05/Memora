"""
Tests pour le service note_share_link (logique métier).

Ces tests vérifient :
- Créer un lien public de partage de note
- Lister les liens publics d'une note
- Supprimer un lien public
- Validation des permissions

Les repositories sont MOCKÉS.
"""
import pytest
from uuid import uuid4
from datetime import datetime
from dtos.note_share_link_dto import NoteShareLinkDTO, NoteShareLinkCreateDTO
from daos.note_share_link_dao import NoteShareLink
from exceptions.note_share_link_exception import NoteShareLinkNotFound


class TestNoteShareLinkServiceDelete:
    """Tests pour supprimer un lien public"""

    def test_delete_share_link_success(self, mock_note_share_link_repository, mock_note_repository):
        """Supprimer un lien public."""
        from services.impl.note.note_share_link_service_impl import note_share_link_service
        from daos.note_dao import Note

        # Arrange
        owner_id = str(uuid4())
        note_id = str(uuid4())
        link_id = str(uuid4())

        note = Note(
            id=note_id, title="Test Note", yjs_snapshot=None, owner_id=owner_id,
            collection_id=str(uuid4()), tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_note_repository.find_one_unscoped.return_value = note

        mock_note_share_link_repository.delete.return_value = True

        # Act
        note_share_link_service.delete_share_link(note_id, link_id)

        # Assert
        mock_note_share_link_repository.delete.assert_called_once_with(link_id)

    def test_delete_nonexistent_link_raises_exception(self, mock_note_share_link_repository, mock_note_repository):
        """Supprimer un lien inexistant lève NoteShareLinkNotFound."""
        from services.impl.note.note_share_link_service_impl import note_share_link_service
        from daos.note_dao import Note

        # Arrange
        owner_id = str(uuid4())
        note_id = str(uuid4())
        link_id = str(uuid4())

        note = Note(
            id=note_id, title="Test Note", yjs_snapshot=None, owner_id=owner_id,
            collection_id=str(uuid4()), tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_note_repository.find_one_unscoped.return_value = note

        mock_note_share_link_repository.delete.return_value = False

        # Act & Assert
        with pytest.raises(NoteShareLinkNotFound):
            note_share_link_service.delete_share_link(note_id, link_id)

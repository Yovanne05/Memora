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
from dtos.note_link_dto import NoteLinkDTO, NoteLinkCreateDTO
from daos.note_dao import NoteLink


class TestNoteLinkServiceDelete:
    """Tests pour supprimer un lien"""

    def test_delete_link_success(self, mock_note_link_repository, mock_note_repository, make_note):
        """Supprimer un lien entre notes."""
        from services.impl.note.note_link_service_impl import note_link_service
        # Arrange
        owner_id = str(uuid4())
        collection_id = str(uuid4())
        note_id_1 = str(uuid4())
        note_id_2 = str(uuid4())

        note1 = make_note(
            note_id=note_id_1,
            owner_id=owner_id,
            collection_id=collection_id,
            title="Note 1",
        )
        note2 = make_note(
            note_id=note_id_2,
            owner_id=owner_id,
            collection_id=collection_id,
            title="Note 2",
        )

        def get_note(nid):
            return note1 if nid == note_id_1 else note2

        mock_note_repository.find_one_unscoped.side_effect = get_note
        mock_note_link_repository.delete.return_value = None

        # Act
        note_link_service.delete_link(note_id_1, note_id_2)

        # Assert
        mock_note_link_repository.delete.assert_called_once_with(note_id_1, note_id_2)

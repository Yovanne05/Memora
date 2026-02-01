"""
Tests pour le service share_note (logique métier).

Ces tests vérifient :
- Partager une note avec un utilisateur
- Mettre à jour les permissions d'un partage
- Révoquer un partage
- Validation des permissions

Les repositories sont MOCKÉS.
"""
import pytest
from uuid import uuid4
from exceptions.note_share_exception import NoteShareNotFound


class TestNoteShareServiceRevoke:
    """Tests pour révoquer un partage"""

    def test_revoke_share_success(self, mock_note_share_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Révoquer un partage avec succès."""
        from services.impl.note.note_share_service_impl import note_share_service
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=owner_id,
            email="owner@example.com",
            username="owner",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.note.note_share_service_impl.get_current_user", lambda: current_user)

        note = make_note(
            note_id=note_id,
            owner_id=owner_id,
            collection_id=str(uuid4()),
            title="Test Note",
        )
        mock_note_repository.find_one_unscoped.return_value = note

        mock_note_share_repository.delete.return_value = True

        monkeypatch.setattr("services.impl.note.note_share_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        # Act
        note_share_service.revoke_share(note_id, user_id)

        # Assert
        mock_note_share_repository.delete.assert_called_once_with(note_id, user_id)

    def test_revoke_nonexistent_share_raises_exception(self, mock_note_share_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Révoquer un partage inexistant lève NoteShareNotFound."""
        from services.impl.note.note_share_service_impl import note_share_service
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=owner_id,
            email="owner@example.com",
            username="owner",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.note.note_share_service_impl.get_current_user", lambda: current_user)

        note = make_note(
            note_id=note_id,
            owner_id=owner_id,
            collection_id=str(uuid4()),
            title="Test Note",
        )
        mock_note_repository.find_one_unscoped.return_value = note

        mock_note_share_repository.delete.return_value = False

        monkeypatch.setattr("services.impl.note.note_share_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        # Act & Assert
        with pytest.raises(NoteShareNotFound):
            note_share_service.revoke_share(note_id, user_id)

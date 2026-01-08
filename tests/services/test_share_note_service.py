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

from dtos.note_share_dto import NoteShareDTO, NoteShareCreateDTO, NoteShareUpdateDTO
from daos.note_dao import NoteShare
from exceptions.note_share_exception import NoteShareNotFound


class TestNoteShareServiceCreate:
    """Tests pour partager une note"""

    def test_share_note_success(self, mock_note_share_repository, mock_note_repository, mock_user_repository, monkeypatch):
        """Partager une note avec succès."""
        from services.impl.note.note_share_service_impl import note_share_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum, SharePermissionEnum

        # Arrange
        owner_id = str(uuid4())
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.note_share_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        target_user = User(id=user_id, email="target@example.com", username="target", password_hash="hash", role=RoleEnum.CLIENT)
        mock_user_repository.find_one.return_value = target_user

        mock_note_share_repository.find_one.return_value = None

        share = NoteShare(
            note_id=note_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )
        mock_note_share_repository.add.return_value = share

        monkeypatch.setattr("services.impl.note.note_share_service_impl.permission_domain_service.can_manage_note", lambda *args: True)

        payload = NoteShareCreateDTO(user_id=user_id, permission=SharePermissionEnum.READ)

        # Act
        result = note_share_service.share_note(note_id, payload)

        # Assert
        assert isinstance(result, NoteShareDTO)
        assert result.note_id == note_id
        assert result.user_id == user_id
        mock_note_share_repository.add.assert_called_once()


class TestNoteShareServiceUpdate:
    """Tests pour mettre à jour un partage"""

    def test_update_share_success(self, mock_note_share_repository, mock_note_repository, monkeypatch):
        """Mettre à jour les permissions d'un partage."""
        from services.impl.note.note_share_service_impl import note_share_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum, SharePermissionEnum

        # Arrange
        owner_id = str(uuid4())
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.note_share_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        share = NoteShare(
            note_id=note_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ
        )
        mock_note_share_repository.find_one.return_value = share
        mock_note_share_repository.update.return_value = share

        monkeypatch.setattr("services.impl.note.note_share_service_impl.permission_domain_service.can_manage_note", lambda *args: True)

        payload = NoteShareUpdateDTO(permission=SharePermissionEnum.WRITE)

        # Act
        result = note_share_service.update_share(note_id, user_id, payload)

        # Assert
        assert isinstance(result, NoteShareDTO)
        mock_note_share_repository.update.assert_called_once()


class TestNoteShareServiceRevoke:
    """Tests pour révoquer un partage"""

    def test_revoke_share_success(self, mock_note_share_repository, mock_note_repository, monkeypatch):
        """Révoquer un partage avec succès."""
        from services.impl.note.note_share_service_impl import note_share_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.note_share_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        mock_note_share_repository.delete.return_value = True

        monkeypatch.setattr("services.impl.note.note_share_service_impl.permission_domain_service.can_manage_note", lambda *args: True)

        # Act
        note_share_service.revoke_share(note_id, user_id)

        # Assert
        mock_note_share_repository.delete.assert_called_once_with(note_id, user_id)

    def test_revoke_nonexistent_share_raises_exception(self, mock_note_share_repository, mock_note_repository, monkeypatch):
        """Révoquer un partage inexistant lève NoteShareNotFound."""
        from services.impl.note.note_share_service_impl import note_share_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        owner_id = str(uuid4())
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.note_share_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        mock_note_share_repository.delete.return_value = False

        monkeypatch.setattr("services.impl.note.note_share_service_impl.permission_domain_service.can_manage_note", lambda *args: True)

        # Act & Assert
        with pytest.raises(NoteShareNotFound):
            note_share_service.revoke_share(note_id, user_id)

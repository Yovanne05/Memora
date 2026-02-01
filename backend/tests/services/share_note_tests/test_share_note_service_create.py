"""
Tests pour le service share_note (logique métier).

Ces tests vérifient :
- Partager une note avec un utilisateur
- Mettre à jour les permissions d'un partage
- Révoquer un partage
- Validation des permissions

Les repositories sont MOCKÉS.
"""
from datetime import datetime
from uuid import uuid4
from dtos.note_share_dto import NoteShareDTO, NoteShareCreateDTO
from daos.note_dao import NoteShare


class TestNoteShareServiceCreate:
    """Tests pour partager une note"""

    def test_share_note_success(self, mock_note_share_repository, mock_note_repository, mock_user_repository, make_note, make_user, monkeypatch):
        """Partager une note avec succès."""
        from services.impl.note.note_share_service_impl import note_share_service
        from utils.enums import RoleEnum, SharePermissionEnum

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

        target_user = make_user(
            user_id=user_id,
            email="target@example.com",
            username="target",
            role=RoleEnum.CLIENT,
        )
        mock_user_repository.find_one.return_value = target_user

        mock_note_share_repository.find_one.return_value = None

        share = NoteShare(
            note_id=note_id,
            user_id=user_id,
            permission=SharePermissionEnum.READ,
            created_at=datetime.now()
        )
        share.user = target_user  # Attach the user relation
        mock_note_share_repository.add.return_value = share

        monkeypatch.setattr("services.impl.note.note_share_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        payload = NoteShareCreateDTO(user_id=user_id, permission=SharePermissionEnum.READ)

        # Act
        result = note_share_service.share_note(note_id, payload)

        # Assert
        assert isinstance(result, NoteShareDTO)
        assert result.note_id == note_id
        assert result.user.id == user_id
        mock_note_share_repository.add.assert_called_once()

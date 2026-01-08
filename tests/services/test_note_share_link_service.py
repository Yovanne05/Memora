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

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            # REMOVED TOKEN,
            permission=SharePermissionEnum.READ
        )
        mock_note_share_link_repository.add.return_value = link

        payload = NoteShareLinkCreateDTO(permission=SharePermissionEnum.READ)

        # Act
        result = note_share_link_service.create_share_link(note_id, payload)

        # Assert
        assert isinstance(result, NoteShareLinkDTO)
        assert result.note_id == note_id
        assert "token" in result.model_dump()
        mock_note_share_link_repository.add.assert_called_once()


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

        current_user = User(id=owner_id, email="owner@example.com", username="owner", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.note_share_link_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        links = [
            NoteShareLink(
                id=str(uuid4()),
                note_id=note_id,
                # REMOVED TOKEN,
                permission=SharePermissionEnum.READ
            )
        ]
        mock_note_share_link_repository.find_many.return_value = (links, 1)

        params = NoteShareLinkSearchParams(note_id=note_id)

        # Act
        result_links, total = note_share_link_service.find_many(params)

        # Assert
        assert total == 1
        assert len(result_links) == 1


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

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
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

        note = Note(id=note_id, title="Test Note", content="", owner_id=owner_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        mock_note_share_link_repository.delete.return_value = False

        # Act & Assert
        with pytest.raises(NoteShareLinkNotFound):
            note_share_link_service.delete_share_link(note_id, link_id)

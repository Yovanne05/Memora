"""
Tests pour le service note (logique métier).

Ces tests vérifient la logique métier du service note :
- Création de notes
- Mise à jour de notes
- Suppression de notes
- Validation des contraintes (titre unique, collection valide)
- Gestion des favoris

Les repositories sont MOCKÉS pour isoler la logique du service.
"""
import pytest
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock
from dtos.note_dto import NoteCreateDTO, NoteUpdateDTO, NoteDTO
from dtos.owner_dto import OwnerDTO
from daos.note_dao import Note
from daos.user_dao import User
from daos.collection_dao import Collection
from exceptions.note_exception import NoteNotFound, NoteTitleConflict, NoteOwnerDoesNotExist
from utils.enums import VisibilityEnum, RoleEnum


class TestNoteServiceUpdate:
    """Tests pour la mise à jour de note"""

    def test_update_note_success(self, mock_note_repository, monkeypatch):
        """Mettre à jour une note existante."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())

        existing_note = Note(
            id=note_id,
            title="Old Title",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE,
            tags=[],
            shares=[],
            share_links=[],
            flashcards=[],
            reports=[],
            outgoing_links=[],
            incoming_links=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        updated_note = Note(
            id=note_id,
            title="New Title",
            owner_id=user_id,
            visibility=VisibilityEnum.PUBLIC,
            tags=[],
            shares=[],
            share_links=[],
            flashcards=[],
            reports=[],
            outgoing_links=[],
            incoming_links=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        mock_note_repository.find_one_unscoped.return_value = existing_note
        mock_note_repository.find_one_by_title.return_value = None
        mock_note_repository.update.return_value = updated_note

        mock_dto = NoteDTO(
            id=note_id,
            owner_id=user_id,
            owner_username="testuser",
            title="New Title",
            visibility=VisibilityEnum.PUBLIC,
            owners=[OwnerDTO(user_id=user_id, username="testuser")],
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.note.note_crud_service_impl.note_to_dto", mock_mapper)

        dto = NoteUpdateDTO(
            title="New Title",
            visibility=VisibilityEnum.PUBLIC
        )

        # Act
        result = note_crud_service.update(note_id, dto)

        # Assert
        assert result.title == "New Title"
        # Content removed (now using yjs_snapshot for real-time collaboration)
        mock_note_repository.find_one_unscoped.assert_called_once_with(note_id)
        mock_note_repository.update.assert_called_once()

    def test_update_note_not_found(self, mock_note_repository):
        """Mettre à jour une note inexistante lève NoteNotFound."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        note_id = str(uuid4())
        mock_note_repository.find_one_unscoped.return_value = None

        dto = NoteUpdateDTO(title="New Title")

        # Act & Assert
        with pytest.raises(NoteNotFound):
            note_crud_service.update(note_id, dto)

        mock_note_repository.update.assert_not_called()

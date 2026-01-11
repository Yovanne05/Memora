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
from daos.note_dao import Note
from daos.user_dao import User
from daos.collection_dao import Collection
from exceptions.note_exception import NoteNotFound, NoteTitleConflict, NoteOwnerDoesNotExist
from utils.enums import VisibilityEnum, RoleEnum


class TestNoteServiceDelete:
    """Tests pour la suppression de note"""

    def test_delete_note_success(self, mock_note_repository):
        """Supprimer une note existante."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        note_id = str(uuid4())
        mock_note_repository.delete.return_value = True

        # Act
        note_crud_service.delete(note_id)

        # Assert
        mock_note_repository.delete.assert_called_once_with(note_id)

    def test_delete_note_not_found(self, mock_note_repository):
        """Supprimer une note inexistante lève NoteNotFound."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        note_id = str(uuid4())
        mock_note_repository.delete.return_value = False

        # Act & Assert
        with pytest.raises(NoteNotFound):
            note_crud_service.delete(note_id)

        mock_note_repository.delete.assert_called_once_with(note_id)

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


class TestNoteServiceFindOne:
    """Tests pour la récupération d'une note"""

    def test_find_one_success(self, mock_note_repository, mock_note_favorite_repository, monkeypatch):
        """Récupérer une note existante."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())

        current_user = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.note.note_crud_service_impl.get_current_user", lambda: current_user)

        note_entity = Note(
            id=note_id,
            title="Test Note",
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
        mock_note_repository.get_for_user.return_value = note_entity
        mock_note_favorite_repository.favorite_note_ids_for_user.return_value = set()

        mock_dto = NoteDTO(
            id=note_id,
            owner_id=user_id,
            owner_username="testuser",
            title="Test Note",
            visibility=VisibilityEnum.PRIVATE,
            owners=[OwnerDTO(user_id=user_id, username="testuser")],
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.note.note_crud_service_impl.note_to_dto", mock_mapper)

        # Act
        result = note_crud_service.find_one(note_id)

        # Assert
        assert isinstance(result, NoteDTO)
        assert result.id == note_id
        assert result.title == "Test Note"
        mock_note_repository.get_for_user.assert_called_once()

    def test_find_one_not_found(self, mock_note_repository, monkeypatch):
        """Récupérer une note inexistante lève NoteNotFound."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        note_id = str(uuid4())
        user_id = str(uuid4())

        current_user = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.note.note_crud_service_impl.get_current_user", lambda: current_user)

        mock_note_repository.get_for_user.return_value = None

        # Act & Assert
        with pytest.raises(NoteNotFound):
            note_crud_service.find_one(note_id)

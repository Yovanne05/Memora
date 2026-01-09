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


class TestNoteServiceCreate:
    """Tests pour la création de note"""

    def test_create_note_success(self, mock_note_repository, mock_user_repository, mock_collection_repository, monkeypatch):
        """Créer une note avec des données valides."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        user_id = str(uuid4())
        collection_id = str(uuid4())
        note_id = str(uuid4())

        mock_user_repository.find_one.return_value = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        mock_collection_repository.find_for_owner.return_value = Collection(
            id=collection_id,
            name="Test Collection",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE,
            tags=[],
            notes=[],
            shares=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        mock_note_repository.find_one_by_title.return_value = None

        created_note = Note(
            id=note_id,
            title="Test Note",
            yjs_snapshot=None,
            owner_id=user_id,
            collection_id=collection_id,
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
        mock_note_repository.add.return_value = created_note

        mock_dto = NoteDTO(
            id=note_id,
            title="Test Note",
            owner_id=user_id,
            owner_username="testuser",
            visibility=VisibilityEnum.PRIVATE,
            owners=[OwnerDTO(user_id=user_id, username="testuser")],
            collection_id=collection_id,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.note.note_crud_service_impl.note_to_dto", mock_mapper)

        dto = NoteCreateDTO(
            title="Test Note",
            yjs_snapshot=None,
            owner_id=user_id,
            collection_id=collection_id,
            visibility=VisibilityEnum.PRIVATE
        )

        # Act
        result = note_crud_service.create(dto)

        # Assert
        assert isinstance(result, NoteDTO)
        assert result.title == "Test Note"
        assert len(result.owners) > 0
        assert result.owners[0].user_id == user_id
        mock_user_repository.find_one.assert_called_once_with(user_id)
        mock_collection_repository.find_for_owner.assert_called_once_with(collection_id, user_id)
        mock_note_repository.add.assert_called_once()

    def test_create_note_raises_user_not_found(self, mock_note_repository, mock_user_repository):
        """Créer une note avec un owner inexistant lève NoteOwnerDoesNotExist."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        user_id = str(uuid4())
        mock_user_repository.find_one.return_value = None

        dto = NoteCreateDTO(
            title="Test Note",
            yjs_snapshot=None,
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE
        )

        # Act & Assert
        with pytest.raises(NoteOwnerDoesNotExist):
            note_crud_service.create(dto)

        mock_user_repository.find_one.assert_called_once_with(user_id)
        mock_note_repository.add.assert_not_called()

    def test_create_note_raises_title_conflict(self, mock_note_repository, mock_user_repository, mock_collection_repository):
        """Créer une note avec un titre existant lève NoteTitleConflict."""
        from services.impl.note.note_crud_service_impl import note_crud_service

        # Arrange
        user_id = str(uuid4())
        collection_id = str(uuid4())

        mock_user_repository.find_one.return_value = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        mock_collection_repository.find_for_owner.return_value = Collection(
            id=collection_id,
            name="Test Collection",
            owner_id=user_id,
            tags=[],
            notes=[],
            shares=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        existing_note = Note(
            id=str(uuid4()),
            title="Duplicate Title",
            owner_id=user_id,
            collection_id=collection_id,
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
        mock_note_repository.find_one_by_title.return_value = existing_note

        dto = NoteCreateDTO(
            title="Duplicate Title",
            yjs_snapshot=None,
            owner_id=user_id,
            collection_id=collection_id
        )

        # Act & Assert
        with pytest.raises(NoteTitleConflict):
            note_crud_service.create(dto)

        mock_note_repository.add.assert_not_called()

"""
Tests pour le service flashcard (logique métier).

Ces tests vérifient :
- Créer une flashcard avec validation des réponses
- Mettre à jour une flashcard
- Supprimer une flashcard
- Dupliquer une flashcard
- Validation: au moins une réponse correcte

Les repositories sont MOCKÉS.
"""
import pytest
from uuid import uuid4

from dtos.flashcard_dto import FlashcardDTO, FlashcardCreateDTO, FlashcardUpdateDTO
from dtos.flashcard_answer_dto import FlashcardAnswerCreateDTO
from daos.flashcard_dao import Flashcard, FlashcardAnswer
from exceptions.flashcard_exception import (
    FlashcardNotFound,
    FlashcardMustHaveAnswers,
    FlashcardMustHaveAtLeastOneCorrectAnswer
)
from exceptions.note_exception import NoteNotFound


class TestFlashcardServiceCreate:
    """Tests pour créer une flashcard"""

    def test_create_flashcard_success(self, mock_flashcard_repository, mock_note_repository, monkeypatch):
        """Créer une flashcard valide."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=user_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        flashcard = Flashcard(
            id=str(uuid4()),
            question="Question?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), answer_text="Answer", is_correct=True)]
        )
        mock_flashcard_repository.add.return_value = flashcard

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        payload = FlashcardCreateDTO(
            question="Question?",
            answers=[FlashcardAnswerCreateDTO(answer_text="Answer", is_correct=True)]
        )

        # Act
        result = flashcard_service.create(note_id, payload)

        # Assert
        assert isinstance(result, FlashcardDTO)
        assert result.question == "Question?"
        mock_note_repository.find_one_unscoped.assert_called_once_with(note_id)
        mock_flashcard_repository.add.assert_called_once()

    def test_create_flashcard_no_answers_raises_exception(self, mock_flashcard_repository, mock_note_repository, monkeypatch):
        """Créer une flashcard sans réponses lève FlashcardMustHaveAnswers."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=user_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        payload = FlashcardCreateDTO(question="Question?", answers=[])

        # Act & Assert
        with pytest.raises(FlashcardMustHaveAnswers):
            flashcard_service.create(note_id, payload)

    def test_create_flashcard_no_correct_answer_raises_exception(self, mock_flashcard_repository, mock_note_repository, monkeypatch):
        """Créer une flashcard sans réponse correcte lève FlashcardMustHaveAtLeastOneCorrectAnswer."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        note = Note(id=note_id, title="Test Note", content="", owner_id=user_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        payload = FlashcardCreateDTO(
            question="Question?",
            answers=[FlashcardAnswerCreateDTO(answer_text="Wrong", is_correct=False)]
        )

        # Act & Assert
        with pytest.raises(FlashcardMustHaveAtLeastOneCorrectAnswer):
            flashcard_service.create(note_id, payload)


class TestFlashcardServiceUpdate:
    """Tests pour mettre à jour une flashcard"""

    def test_update_flashcard_success(self, mock_flashcard_repository, monkeypatch):
        """Mettre à jour une flashcard."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        flashcard_id = str(uuid4())

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        flashcard = Flashcard(
            id=flashcard_id,
            question="Old question?",
            note_id=str(uuid4()),
            answers=[FlashcardAnswer(id=str(uuid4()), answer_text="Answer", is_correct=True)]
        )
        mock_flashcard_repository.find_one_unscoped.return_value = flashcard
        mock_flashcard_repository.update.return_value = flashcard

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        payload = FlashcardUpdateDTO(question="New question?")

        # Act
        result = flashcard_service.update(flashcard_id, payload)

        # Assert
        assert isinstance(result, FlashcardDTO)
        mock_flashcard_repository.update.assert_called_once()


class TestFlashcardServiceDelete:
    """Tests pour supprimer une flashcard"""

    def test_delete_flashcard_success(self, mock_flashcard_repository, monkeypatch):
        """Supprimer une flashcard."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        flashcard_id = str(uuid4())

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        flashcard = Flashcard(
            id=flashcard_id,
            question="Question?",
            note_id=str(uuid4()),
            answers=[]
        )
        mock_flashcard_repository.find_one_unscoped.return_value = flashcard
        mock_flashcard_repository.delete.return_value = None

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_manage_note", lambda *args: True)

        # Act
        flashcard_service.delete(flashcard_id)

        # Assert
        mock_flashcard_repository.delete.assert_called_once_with(flashcard_id)


class TestFlashcardServiceDuplicate:
    """Tests pour dupliquer une flashcard"""

    def test_duplicate_flashcard_success(self, mock_flashcard_repository, mock_note_repository, monkeypatch):
        """Dupliquer une flashcard."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        flashcard_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT)
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        source_flashcard = Flashcard(
            id=flashcard_id,
            question="Original?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), answer_text="Answer", is_correct=True)]
        )
        mock_flashcard_repository.find_one_unscoped.return_value = source_flashcard

        note = Note(id=note_id, title="Test Note", content="", owner_id=user_id, collection_id=str(uuid4()))
        mock_note_repository.find_one_unscoped.return_value = note

        duplicated = Flashcard(
            id=str(uuid4()),
            question="Original?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), answer_text="Answer", is_correct=True)]
        )
        mock_flashcard_repository.add.return_value = duplicated

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        # Act
        result = flashcard_service.duplicate(flashcard_id)

        # Assert
        assert isinstance(result, FlashcardDTO)
        assert result.question == "Original?"
        mock_flashcard_repository.add.assert_called_once()

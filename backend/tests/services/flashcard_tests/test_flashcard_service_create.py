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
from datetime import datetime
from dtos.flashcard_dto import FlashcardDTO, FlashcardCreateDTO
from dtos.flashcard_answer_dto import FlashcardAnswerCreateDTO
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from exceptions.flashcard_exception import (
    FlashcardMustHaveAtLeastOneCorrectAnswer
)


class TestFlashcardServiceCreate:
    """Tests pour créer une flashcard"""

    def test_create_flashcard_success(self, mock_flashcard_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Créer une flashcard valide."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=user_id,
            email="test@example.com",
            username="test",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        note = make_note(
            note_id=note_id,
            owner_id=user_id,
            collection_id=str(uuid4()),
            title="Test Note",
        )
        mock_note_repository.find_one_unscoped.return_value = note

        flashcard = Flashcard(
            id=str(uuid4()),
            question="Question?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=str(uuid4()), answer_text="Answer", is_correct=True, created_at=datetime.now())],
            created_at=datetime.now(),
            updated_at=datetime.now()
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

    def test_create_flashcard_no_answers_raises_exception(self, mock_flashcard_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Créer une flashcard sans réponses lève une ValidationError (validation Pydantic)."""
        from pydantic import ValidationError
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=user_id,
            email="test@example.com",
            username="test",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        note = make_note(
            note_id=note_id,
            owner_id=user_id,
            collection_id=str(uuid4()),
            title="Test Note",
        )
        mock_note_repository.find_one_unscoped.return_value = note

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        # Act & Assert
        with pytest.raises(ValidationError):
            FlashcardCreateDTO(question="Question?", answers=[])

    def test_create_flashcard_no_correct_answer_raises_exception(self, mock_flashcard_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Créer une flashcard sans réponse correcte lève FlashcardMustHaveAtLeastOneCorrectAnswer."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=user_id,
            email="test@example.com",
            username="test",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        note = make_note(
            note_id=note_id,
            owner_id=user_id,
            collection_id=str(uuid4()),
            title="Test Note",
        )
        mock_note_repository.find_one_unscoped.return_value = note

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        payload = FlashcardCreateDTO(
            question="Question?",
            answers=[FlashcardAnswerCreateDTO(answer_text="Wrong", is_correct=False)]
        )

        # Act & Assert
        with pytest.raises(FlashcardMustHaveAtLeastOneCorrectAnswer):
            flashcard_service.create(note_id, payload)


class TestFlashcardServiceDuplicate:
    """Tests pour dupliquer une flashcard"""

    def test_duplicate_flashcard_success(self, mock_flashcard_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Dupliquer une flashcard."""
        from services.impl.note.flashcard_service_impl import flashcard_service
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        flashcard_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=user_id,
            email="test@example.com",
            username="test",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        source_flashcard = Flashcard(
            id=flashcard_id,
            question="Original?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=str(uuid4()), answer_text="Answer", is_correct=True, created_at=datetime.now())],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_flashcard_repository.find_one_unscoped.return_value = source_flashcard

        note = make_note(
            note_id=note_id,
            owner_id=user_id,
            collection_id=str(uuid4()),
            title="Test Note",
        )
        mock_note_repository.find_one_unscoped.return_value = note

        duplicated = Flashcard(
            id=str(uuid4()),
            question="Original?",
            note_id=note_id,
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=str(uuid4()), answer_text="Answer", is_correct=True, created_at=datetime.now())],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_flashcard_repository.add.return_value = duplicated

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        # Act
        result = flashcard_service.duplicate(flashcard_id)

        # Assert
        assert isinstance(result, FlashcardDTO)
        assert result.question == "Original?"
        mock_flashcard_repository.add.assert_called_once()

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
from uuid import uuid4
from datetime import datetime
from dtos.flashcard_dto import FlashcardDTO, FlashcardUpdateDTO
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer


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

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now())
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        flashcard = Flashcard(
            id=flashcard_id,
            question="Old question?",
            note_id=str(uuid4()),
            answers=[FlashcardAnswer(id=str(uuid4()), flashcard_id=str(uuid4()), answer_text="Answer", is_correct=True, created_at=datetime.now())],
            created_at=datetime.now(),
            updated_at=datetime.now()
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

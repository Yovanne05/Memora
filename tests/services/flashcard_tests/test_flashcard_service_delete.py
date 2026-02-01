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
from daos.flashcard_dao import Flashcard


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

        current_user = User(id=user_id, email="test@example.com", username="test", password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now())
        monkeypatch.setattr("services.impl.note.flashcard_service_impl.get_current_user", lambda: current_user)

        flashcard = Flashcard(
            id=flashcard_id,
            question="Question?",
            note_id=str(uuid4()),
            answers=[]
        )
        mock_flashcard_repository.find_one_unscoped.return_value = flashcard
        mock_flashcard_repository.delete.return_value = None

        monkeypatch.setattr("services.impl.note.flashcard_service_impl.permission_domain_service.can_write_note", lambda *args: True)

        # Act
        flashcard_service.delete(flashcard_id)

        # Assert
        mock_flashcard_repository.delete.assert_called_once_with(flashcard_id)

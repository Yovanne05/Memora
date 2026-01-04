"""
Fixtures pour les tests de reviews
"""
from dataclasses import dataclass, field
import pytest
from tests.note.conftest import app_client, note_test_data, client_with_note_data


@dataclass
class ReviewTestData:
    """Extension de NoteTestData avec des flashcards pour les tests de reviews"""

    note_data: "NoteTestData"
    flashcard_ids: list[str] = field(default_factory=list)
    flashcard_answer_ids: dict[str, list[str]] = field(
        default_factory=dict
    )  # flashcard_id -> [answer_ids]
    correct_answer_ids: dict[str, str] = field(
        default_factory=dict
    )  # flashcard_id -> correct_answer_id

    @property
    def client(self):
        return self.note_data.client

    def create_flashcard(
        self, question: str, answers: list[dict[str, any]], note_id: str | None = None
    ) -> dict:
        """Crée une flashcard avec ses réponses"""
        target_note_id = note_id or self.note_data.note_id
        payload = {"question": question, "answers": answers}

        response = self.client.post(f"/flashcards/{target_note_id}", json=payload)
        assert response.status_code == 201, response.get_data(as_text=True)
        body = response.get_json()

        flashcard_id = body["id"]
        self.flashcard_ids.append(flashcard_id)

        # Stocker les answer_ids
        answer_ids = [answer["id"] for answer in body["answers"]]
        self.flashcard_answer_ids[flashcard_id] = answer_ids

        # Stocker la réponse correcte
        correct_answer = next(answer for answer in body["answers"] if answer["is_correct"])
        self.correct_answer_ids[flashcard_id] = correct_answer["id"]

        return body

    def get_incorrect_answer_id(self, flashcard_id: str) -> str:
        """Récupère un answer_id incorrect pour une flashcard"""
        all_answers = self.flashcard_answer_ids[flashcard_id]
        correct = self.correct_answer_ids[flashcard_id]
        incorrect = [aid for aid in all_answers if aid != correct]
        return incorrect[0] if incorrect else None

    def cleanup(self):
        """Cleanup des flashcards créées"""
        for flashcard_id in self.flashcard_ids:
            self.client.delete(f"/flashcards/{flashcard_id}")


@pytest.fixture
def review_test_data(note_test_data):
    """Fixture qui fournit un contexte de test avec flashcards"""
    data = ReviewTestData(note_data=note_test_data)

    # Créer quelques flashcards de test par défaut
    data.create_flashcard(
        question="What is the capital of France?",
        answers=[
            {"answer_text": "Paris", "is_correct": True},
            {"answer_text": "London", "is_correct": False},
            {"answer_text": "Berlin", "is_correct": False},
        ],
    )

    data.create_flashcard(
        question="What is 2 + 2?",
        answers=[
            {"answer_text": "3", "is_correct": False},
            {"answer_text": "4", "is_correct": True},
            {"answer_text": "5", "is_correct": False},
        ],
    )

    try:
        yield data
    finally:
        data.cleanup()


@pytest.fixture
def client_with_review_data(review_test_data):
    """Fixture qui fournit le client et les données de test"""
    yield review_test_data.client, review_test_data

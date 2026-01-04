from typing import Protocol

from dtos.review_dto import ReviewDTO, UpcomingReviewsGroupDTO


class ReviewServiceInterface(Protocol):
    def submit_review(
        self, user_id: str, flashcard_id: str, selected_answer_id: str, difficulty: str
    ) -> ReviewDTO:
        """Enregistre une review et calcule le prochain intervalle."""
        ...

    def get_upcoming_reviews(self, user_id: str) -> list[UpcomingReviewsGroupDTO]:
        """Récupère les flashcards à réviser, groupées par date."""
        ...

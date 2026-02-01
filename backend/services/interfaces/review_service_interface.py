from typing import Protocol

from dtos.review_dto import ReviewDTO, UpcomingReviewsGroupDTO


class ReviewServiceInterface(Protocol):
    def submit_review(
        self, user_id: str, flashcard_id: str, selected_answer_id: str, difficulty: str
    ) -> ReviewDTO:
        ...

    def get_upcoming_reviews(self, user_id: str) -> list[UpcomingReviewsGroupDTO]:
        ...

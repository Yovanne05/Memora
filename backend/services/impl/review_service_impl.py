from datetime import datetime, timezone
from decimal import Decimal

from daos.review_dao import Review
from domain_services.sm2_algorithm import calculate_next_review
from dtos.review_dto import (
    ReviewDTO,
    UpcomingReviewsGroupDTO,
    FlashcardWithReviewDTO,
)
from exceptions.review_exception import (
    FlashcardNotFoundForReview,
    InvalidAnswerForFlashcard,
)
from repositorys import flashcard_repository, review_repository
from services.interfaces.review_service_interface import ReviewServiceInterface
from utils.enums import ReviewDifficultyEnum


class ReviewService(ReviewServiceInterface):
    def submit_review(
        self,
        user_id: str,
        flashcard_id: str,
        selected_answer_id: str,
        difficulty: str,
    ) -> ReviewDTO:
        flashcard = flashcard_repository.find_one_unscoped(flashcard_id)
        if not flashcard:
            raise FlashcardNotFoundForReview()

        answer_ids = [answer.id for answer in flashcard.answers]
        if selected_answer_id not in answer_ids:
            raise InvalidAnswerForFlashcard()

        is_correct = any(
            answer.id == selected_answer_id and answer.is_correct
            for answer in flashcard.answers
        )

        correct_answer = next(
            (answer for answer in flashcard.answers if answer.is_correct),
            None
        )
        correct_answer_id = correct_answer.id if correct_answer else selected_answer_id

        existing_review = review_repository.get_review(user_id, flashcard_id)

        if existing_review:
            current_e_factor = existing_review.e_factor
            current_repetitions = existing_review.repetitions
            current_interval = existing_review.interval_days
        else:
            current_e_factor = Decimal("2.5")
            current_repetitions = 0
            current_interval = 0

        difficulty_enum = ReviewDifficultyEnum(difficulty)
        sm2_result = calculate_next_review(
            difficulty=difficulty_enum,
            current_e_factor=current_e_factor,
            current_repetitions=current_repetitions,
            current_interval_days=current_interval,
        )

        review = Review(
            user_id=user_id,
            flashcard_id=flashcard_id,
            selected_answer_id=selected_answer_id,
            is_correct=is_correct,
            difficulty=difficulty_enum,
            e_factor=sm2_result.e_factor,
            repetitions=sm2_result.repetitions,
            interval_days=sm2_result.interval_days,
            next_review_at=sm2_result.next_review_at,
            reviewed_at=datetime.now(timezone.utc),
        )

        saved_review = review_repository.upsert_review(review)

        return ReviewDTO(
            user_id=saved_review.user_id,
            flashcard_id=saved_review.flashcard_id,
            selected_answer_id=saved_review.selected_answer_id,
            is_correct=saved_review.is_correct,
            correct_answer_id=correct_answer_id,
            difficulty=saved_review.difficulty,
            e_factor=saved_review.e_factor,
            repetitions=saved_review.repetitions,
            interval_days=saved_review.interval_days,
            next_review_at=saved_review.next_review_at,
            reviewed_at=saved_review.reviewed_at,
        )

    def get_upcoming_reviews(self, user_id: str) -> list[UpcomingReviewsGroupDTO]:
        grouped_reviews = review_repository.get_upcoming_reviews(user_id)

        result = []
        for date_str, flashcards in sorted(grouped_reviews.items()):
            flashcard_dtos = [
                FlashcardWithReviewDTO(
                    flashcard_id=fc_id,
                    question=question,
                    next_review_at=next_review_at,
                )
                for fc_id, question, next_review_at in flashcards
            ]

            result.append(
                UpcomingReviewsGroupDTO(date=date_str, flashcards=flashcard_dtos)
            )

        return result


review_service = ReviewService()

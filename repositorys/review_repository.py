from datetime import datetime, timedelta, timezone
from typing import NamedTuple
from collections import defaultdict

from sqlalchemy import select, func, and_, case
from sqlalchemy.dialects.postgresql import insert

from daos.review_dao import Review
from daos.flashcard_dao import Flashcard
from utils.db import get_db_session
from utils.enums import ReviewDifficultyEnum


class ReviewStatistics(NamedTuple):
    """Statistiques agrégées des reviews"""
    total_reviews: int
    reviews_last_7_days: int
    reviews_last_30_days: int
    average_quality: float
    quality_distribution: dict[str, int]


def upsert_review(review: Review) -> Review:
    with get_db_session() as session:
        stmt = insert(Review).values(
            user_id=review.user_id,
            flashcard_id=review.flashcard_id,
            selected_answer_id=review.selected_answer_id,
            is_correct=review.is_correct,
            difficulty=review.difficulty,
            e_factor=review.e_factor,
            repetitions=review.repetitions,
            interval_days=review.interval_days,
            next_review_at=review.next_review_at,
            reviewed_at=review.reviewed_at,
        )

        stmt = stmt.on_conflict_do_update(
            index_elements=["user_id", "flashcard_id"],
            set_={
                "selected_answer_id": stmt.excluded.selected_answer_id,
                "is_correct": stmt.excluded.is_correct,
                "difficulty": stmt.excluded.difficulty,
                "e_factor": stmt.excluded.e_factor,
                "repetitions": stmt.excluded.repetitions,
                "interval_days": stmt.excluded.interval_days,
                "next_review_at": stmt.excluded.next_review_at,
                "reviewed_at": stmt.excluded.reviewed_at,
            },
        )

        session.execute(stmt)
        session.commit()

        result = session.execute(
            select(Review).where(
                and_(
                    Review.user_id == review.user_id,
                    Review.flashcard_id == review.flashcard_id,
                )
            )
        ).scalar_one()

        return result


def get_review(user_id: str, flashcard_id: str) -> Review | None:
    with get_db_session() as session:
        stmt = select(Review).where(
            and_(
                Review.user_id == user_id,
                Review.flashcard_id == flashcard_id,
            )
        )
        return session.execute(stmt).scalar_one_or_none()


def get_upcoming_reviews(user_id: str) -> dict[str, list[tuple[str, str, datetime]]]:
    with get_db_session() as session:
        stmt = (
            select(
                Review.flashcard_id,
                Flashcard.question,
                Review.next_review_at,
            )
            .join(Flashcard, Review.flashcard_id == Flashcard.id)
            .where(Review.user_id == user_id)
            .order_by(Review.next_review_at.asc())
        )

        results = session.execute(stmt).all()

        grouped: dict[str, list[tuple[str, str, datetime]]] = defaultdict(list)
        for flashcard_id, question, next_review_at in results:
            date_key = next_review_at.date().isoformat()
            grouped[date_key].append((flashcard_id, question, next_review_at))

        return dict(grouped)


def get_review_statistics(user_id: str) -> ReviewStatistics:
    """Récupère les statistiques de review pour un utilisateur."""
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    with get_db_session() as session:
        total_stmt = select(func.count(Review.user_id)).where(
            Review.user_id == user_id
        )
        total = session.scalar(total_stmt) or 0

        last_7_stmt = select(func.count(Review.user_id)).where(
            and_(
                Review.user_id == user_id,
                Review.reviewed_at >= seven_days_ago,
            )
        )
        last_7 = session.scalar(last_7_stmt) or 0

        last_30_stmt = select(func.count(Review.user_id)).where(
            and_(
                Review.user_id == user_id,
                Review.reviewed_at >= thirty_days_ago,
            )
        )
        last_30 = session.scalar(last_30_stmt) or 0

        quality_case = case(
            (Review.difficulty == ReviewDifficultyEnum.AGAIN, 0),
            (Review.difficulty == ReviewDifficultyEnum.HARD, 1),
            (Review.difficulty == ReviewDifficultyEnum.GOOD, 2),
            (Review.difficulty == ReviewDifficultyEnum.EASY, 3),
            else_=0,
        )

        avg_stmt = select(func.avg(quality_case)).where(Review.user_id == user_id)
        avg_quality = session.scalar(avg_stmt) or 0.0

        dist_stmt = (
            select(Review.difficulty, func.count(Review.difficulty))
            .where(Review.user_id == user_id)
            .group_by(Review.difficulty)
        )

        distribution = {}
        for difficulty, count in session.execute(dist_stmt):
            distribution[difficulty.value] = count

        for diff in ReviewDifficultyEnum:
            if diff.value not in distribution:
                distribution[diff.value] = 0

        return ReviewStatistics(
            total_reviews=total,
            reviews_last_7_days=last_7,
            reviews_last_30_days=last_30,
            average_quality=float(avg_quality),
            quality_distribution=distribution,
        )

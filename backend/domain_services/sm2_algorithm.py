"""
SM-2 (SuperMemo 2) algorithm for spaced repetition.

The algorithm computes the next review interval based on user performance.
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import NamedTuple

from utils.enums import ReviewDifficultyEnum


class SM2Result(NamedTuple):
    """Result of the SM-2 calculation"""
    e_factor: Decimal
    repetitions: int
    interval_days: int
    next_review_at: datetime


def calculate_next_review(
    difficulty: ReviewDifficultyEnum,
    current_e_factor: Decimal,
    current_repetitions: int,
    current_interval_days: int,
) -> SM2Result:
    """
    Compute the next review interval using the SM-2 algorithm.

    Args:
        difficulty: Perceived difficulty (again, hard, good, easy)
        current_e_factor: Current ease factor (>=1.3)
        current_repetitions: Number of consecutive successful repetitions
        current_interval_days: Current interval in days

    Returns:
        SM2Result with updated values

    Reference: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
    """
    quality_map = {
        ReviewDifficultyEnum.AGAIN: 0,
        ReviewDifficultyEnum.HARD: 1,
        ReviewDifficultyEnum.GOOD: 2,
        ReviewDifficultyEnum.EASY: 3,
    }
    quality = quality_map[difficulty]

    if quality == 0:
        new_repetitions = 0
        new_interval = 1
        new_e_factor = current_e_factor
    else:
        # EF' = EF + (0.1 - (3-q) * (0.08 + (3-q) * 0.02))
        ef_delta = Decimal("0.1") - (Decimal(3 - quality)) * (
            Decimal("0.08") + (Decimal(3 - quality)) * Decimal("0.02")
        )
        new_e_factor = current_e_factor + ef_delta

        if new_e_factor < Decimal("1.3"):
            new_e_factor = Decimal("1.3")

        new_repetitions = current_repetitions + 1

        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            new_interval = int(current_interval_days * float(new_e_factor))

    next_review_at = datetime.now(timezone.utc) + timedelta(days=new_interval)

    return SM2Result(
        e_factor=new_e_factor,
        repetitions=new_repetitions,
        interval_days=new_interval,
        next_review_at=next_review_at,
    )

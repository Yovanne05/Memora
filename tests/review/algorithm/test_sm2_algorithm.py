"""Tests for SM-2 algorithm implementation"""
from decimal import Decimal
from datetime import datetime, timedelta, timezone
from domain_services.sm2_algorithm import calculate_next_review
from utils.enums import ReviewDifficultyEnum


def test_sm2_first_review_good():
    """Test SM-2 calculation for first review with 'good' difficulty"""
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.GOOD,
        current_e_factor=Decimal("2.5"),
        current_repetitions=0,
        current_interval_days=0,
    )

    assert result.e_factor == Decimal("2.5")  # E-factor remains 2.5 for quality 2
    assert result.repetitions == 1
    assert result.interval_days == 1  # First interval is always 1 day
    assert isinstance(result.next_review_at, datetime)


def test_sm2_first_review_easy():
    """Test SM-2 calculation for first review with 'easy' difficulty"""
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.EASY,
        current_e_factor=Decimal("2.5"),
        current_repetitions=0,
        current_interval_days=0,
    )

    # Easy (quality 3) should increase e_factor
    assert result.e_factor > Decimal("2.5")
    assert result.repetitions == 1
    assert result.interval_days == 1


def test_sm2_first_review_hard():
    """Test SM-2 calculation for first review with 'hard' difficulty"""
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.HARD,
        current_e_factor=Decimal("2.5"),
        current_repetitions=0,
        current_interval_days=0,
    )

    # Hard (quality 1) should decrease e_factor
    assert result.e_factor < Decimal("2.5")
    assert result.e_factor >= Decimal("1.3")  # Minimum e_factor
    assert result.repetitions == 1
    assert result.interval_days == 1


def test_sm2_first_review_again():
    """Test SM-2 calculation for first review with 'again' difficulty (failure)"""
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.AGAIN,
        current_e_factor=Decimal("2.5"),
        current_repetitions=0,
        current_interval_days=0,
    )

    # Again (quality 0, < 2) should reset learning
    assert result.e_factor == Decimal("2.5")  # E-factor doesn't change on failure
    assert result.repetitions == 0  # Reset to 0
    assert result.interval_days == 1  # Reset to 1 day


def test_sm2_second_review_good():
    """Test SM-2 calculation for second review with 'good' difficulty"""
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.GOOD,
        current_e_factor=Decimal("2.5"),
        current_repetitions=1,
        current_interval_days=1,
    )

    assert result.repetitions == 2
    assert result.interval_days == 6  # Second interval is always 6 days


def test_sm2_third_review_good():
    """Test SM-2 calculation for third review with 'good' difficulty"""
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.GOOD,
        current_e_factor=Decimal("2.5"),
        current_repetitions=2,
        current_interval_days=6,
    )

    assert result.repetitions == 3
    # Third interval = previous_interval * e_factor = 6 * 2.5 = 15
    assert result.interval_days == 15


def test_sm2_e_factor_minimum():
    """Test that e_factor never goes below 1.3"""
    # Multiple 'again' in a row should keep e_factor at minimum
    e_factor = Decimal("2.5")

    for _ in range(10):
        result = calculate_next_review(
            difficulty=ReviewDifficultyEnum.AGAIN,
            current_e_factor=e_factor,
            current_repetitions=0,
            current_interval_days=0,
        )
        e_factor = result.e_factor

    # Even after many failures, e_factor should stay at 2.5 (doesn't change on failure)
    assert e_factor == Decimal("2.5")

    # But if we use 'hard' many times
    e_factor = Decimal("2.5")
    for _ in range(20):
        result = calculate_next_review(
            difficulty=ReviewDifficultyEnum.HARD,
            current_e_factor=e_factor,
            current_repetitions=1,
            current_interval_days=1,
        )
        e_factor = result.e_factor

    # Should never go below 1.3
    assert e_factor >= Decimal("1.3")


def test_sm2_e_factor_increases_with_easy():
    """Test that e_factor increases with 'easy' difficulty"""
    initial_e_factor = Decimal("2.5")

    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.EASY,
        current_e_factor=initial_e_factor,
        current_repetitions=1,
        current_interval_days=1,
    )

    assert result.e_factor > initial_e_factor


def test_sm2_e_factor_decreases_with_hard():
    """Test that e_factor decreases with 'hard' difficulty"""
    initial_e_factor = Decimal("2.5")

    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.HARD,
        current_e_factor=initial_e_factor,
        current_repetitions=1,
        current_interval_days=1,
    )

    assert result.e_factor < initial_e_factor


def test_sm2_failure_resets_repetitions():
    """Test that failure (quality < 2) resets repetitions to 0"""
    # After several successful reviews
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.AGAIN,
        current_e_factor=Decimal("2.5"),
        current_repetitions=5,  # Was at 5 repetitions
        current_interval_days=30,
    )

    # Should reset to 0
    assert result.repetitions == 0
    assert result.interval_days == 1


def test_sm2_interval_calculation_third_review():
    """Test interval calculation for reviews beyond the second"""
    # Third review with different e_factors
    e_factor = Decimal("3.0")
    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.GOOD,
        current_e_factor=e_factor,
        current_repetitions=2,
        current_interval_days=6,
    )

    # interval = previous_interval * e_factor = 6 * 3.0 = 18
    assert result.interval_days == 18


def test_sm2_next_review_date_calculation():
    """Test that next_review_at is calculated correctly"""
    before = datetime.now(timezone.utc)

    result = calculate_next_review(
        difficulty=ReviewDifficultyEnum.GOOD,
        current_e_factor=Decimal("2.5"),
        current_repetitions=2,
        current_interval_days=6,
    )

    after = datetime.now(timezone.utc)

    # Next review should be interval_days in the future
    expected_min = before + timedelta(days=result.interval_days)
    expected_max = after + timedelta(days=result.interval_days)

    assert expected_min <= result.next_review_at <= expected_max


def test_sm2_quality_mapping():
    """Test that difficulty enum maps to correct quality values"""
    # This is implicitly tested by other tests, but let's be explicit

    # Again (0) -> repetitions reset
    result_again = calculate_next_review(
        ReviewDifficultyEnum.AGAIN, Decimal("2.5"), 3, 10
    )
    assert result_again.repetitions == 0

    # Hard (1) -> repetitions continue
    result_hard = calculate_next_review(
        ReviewDifficultyEnum.HARD, Decimal("2.5"), 3, 10
    )
    assert result_hard.repetitions == 4

    # Good (2) -> repetitions continue
    result_good = calculate_next_review(
        ReviewDifficultyEnum.GOOD, Decimal("2.5"), 3, 10
    )
    assert result_good.repetitions == 4

    # Easy (3) -> repetitions continue, e_factor increases most
    result_easy = calculate_next_review(
        ReviewDifficultyEnum.EASY, Decimal("2.5"), 3, 10
    )
    assert result_easy.repetitions == 4
    assert result_easy.e_factor > result_good.e_factor


def test_sm2_progressive_intervals():
    """Test that intervals progressively increase with successful reviews"""
    e_factor = Decimal("2.5")
    repetitions = 0
    interval = 0
    intervals = []

    # Simulate 5 successful 'good' reviews
    for _ in range(5):
        result = calculate_next_review(
            ReviewDifficultyEnum.GOOD, e_factor, repetitions, interval
        )
        intervals.append(result.interval_days)
        e_factor = result.e_factor
        repetitions = result.repetitions
        interval = result.interval_days

    # Intervals should be: 1, 6, 15, 37, 92 (approximately)
    assert intervals[0] == 1
    assert intervals[1] == 6
    assert intervals[2] == 15
    # Subsequent intervals should keep increasing
    assert intervals[3] > intervals[2]
    assert intervals[4] > intervals[3]

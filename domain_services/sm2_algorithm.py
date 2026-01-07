"""
Algorithme SM-2 (SuperMemo 2) pour la répétition espacée.

L'algorithme calcule le prochain intervalle de révision basé sur la performance de l'utilisateur.
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import NamedTuple

from utils.enums import ReviewDifficultyEnum


class SM2Result(NamedTuple):
    """Résultat du calcul SM-2"""
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
    Calcule le prochain intervalle de révision selon l'algorithme SM-2.

    Args:
        difficulty: Difficulté perçue (again, hard, good, easy)
        current_e_factor: Facteur de facilité actuel (>=1.3)
        current_repetitions: Nombre de répétitions consécutives réussies
        current_interval_days: Intervalle actuel en jours

    Returns:
        SM2Result avec les nouvelles valeurs

    Référence : https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
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

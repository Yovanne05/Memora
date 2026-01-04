from werkzeug.exceptions import NotFound, BadRequest


class FlashcardNotFoundForReview(NotFound):
    def __init__(self, description: str = "Flashcard introuvable pour cette review."):
        super().__init__(description=description)


class InvalidAnswerForFlashcard(BadRequest):
    def __init__(
        self, description: str = "La réponse sélectionnée n'appartient pas à cette flashcard."
    ):
        super().__init__(description=description)

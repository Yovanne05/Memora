from werkzeug.exceptions import BadRequest, NotFound


class FlashcardNotFound(NotFound):
    def __init__(self, description: str = "Flashcard not found."):
        super().__init__(description=description)


class FlashcardMustHaveAnswers(BadRequest):
    def __init__(self, description: str = "Flashcard must have at least one answer."):
        super().__init__(description=description)


class FlashcardMustHaveAtLeastOneCorrectAnswer(BadRequest):
    def __init__(self, description: str = "Flashcard must have at least one correct answer."):
        super().__init__(description=description)

from werkzeug.exceptions import BadRequest, Conflict, NotFound, UnprocessableEntity


class NoteNotFound(NotFound):
    def __init__(self, description: str = "Note not found."):
        super().__init__(description=description)


class NoteOwnerDoesNotExist(UnprocessableEntity):
    def __init__(self, description: str = "Owner does not exist."):
        super().__init__(description=description)


class NoteCollectionDoesNotExist(UnprocessableEntity):
    def __init__(
        self,
        description: str = "Collection does not exist or is not accessible.",
    ):
        super().__init__(description=description)


class NoteTitleConflict(Conflict):
    def __init__(
        self, description: str = "A note with the same title already exists."
    ):
        super().__init__(description=description)


class NoteShareTargetDoesNotExist(UnprocessableEntity):
    def __init__(
        self, description: str = "The target user does not exist."
    ):
        super().__init__(description=description)


class NoteShareAlreadyExists(Conflict):
    def __init__(
        self,
        description: str = "This note is already shared with the target user.",
    ):
        super().__init__(description=description)


class NoteShareNotFound(NotFound):
    def __init__(
        self,
        description: str = "The share configuration for this user was not found.",
    ):
        super().__init__(description=description)


class NoteShareWithOwnerForbidden(UnprocessableEntity):
    def __init__(
        self,
        description: str = "Sharing a note with its owner is not allowed.",
    ):
        super().__init__(description=description)


class NoteLinkAlreadyExists(Conflict):
    def __init__(
        self, description: str = "These notes are already linked."
    ):
        super().__init__(description=description)


class NoteLinkNotFound(NotFound):
    def __init__(self, description: str = "Note link not found."):
        super().__init__(description=description)


class NoteLinkCrossCollection(UnprocessableEntity):
    def __init__(
        self,
        description: str = "Notes can only be linked if they belong to the same collection.",
    ):
        super().__init__(description=description)


class NoteLinkCollectionChangeForbidden(UnprocessableEntity):
    def __init__(
        self,
        description: str = "Cannot change collection for a note that has existing links.",
    ):
        super().__init__(description=description)


class NoteLinkSelfReferenceForbidden(UnprocessableEntity):
    def __init__(
        self, description: str = "Linking a note to itself is not allowed."
    ):
        super().__init__(description=description)


class NoteImageNotFound(NotFound):
    def __init__(self, description: str = "Image not found for this note."):
        super().__init__(description=description)


class NoFileProvided(BadRequest):
    def __init__(self, description: str = "No file provided."):
        super().__init__(description=description)


class InvalidFileType(BadRequest):
    def __init__(
        self,
        description: str = "File type not allowed. Allowed extensions: jpg, jpeg, png, gif, webp.",
    ):
        super().__init__(description=description)


class FileTooLarge(BadRequest):
    def __init__(self, description: str = "File too large."):
        super().__init__(description=description)


class FlashcardNotFound(NotFound):
    def __init__(self, description: str = "Flashcard not found."):
        super().__init__(description=description)


class FlashcardMustHaveAnswers(BadRequest):
    def __init__(self, description: str = "Flashcard must have at least one answer."):
        super().__init__(description=description)


class FlashcardMustHaveOneCorrectAnswer(BadRequest):
    def __init__(self, description: str = "Flashcard must have exactly one correct answer."):
        super().__init__(description=description)

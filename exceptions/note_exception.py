from werkzeug.exceptions import Conflict, NotFound, UnprocessableEntity


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

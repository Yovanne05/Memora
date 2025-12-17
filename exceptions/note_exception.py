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

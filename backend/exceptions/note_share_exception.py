from werkzeug.exceptions import Conflict, Forbidden, NotFound, UnprocessableEntity


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


class NoteSharePermissionDenied(Forbidden):
    def __init__(
        self,
        description: str = "You do not have permission to manage shares for this note.",
    ):
        super().__init__(description=description)

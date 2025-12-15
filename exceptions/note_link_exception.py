from werkzeug.exceptions import Conflict, NotFound, UnprocessableEntity


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

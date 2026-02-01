from werkzeug.exceptions import Conflict, NotFound, UnprocessableEntity


class CollectionNotFound(NotFound):
    def __init__(self, description: str = "Collection not found."):
        super().__init__(description=description)


class CollectionOwnerDoesNotExist(UnprocessableEntity):
    def __init__(self, description: str = "Owner does not exist."):
        super().__init__(description=description)


class CollectionTitleConflict(Conflict):
    def __init__(
        self, description: str = "A collection with the same title already exists."
    ):
        super().__init__(description=description)

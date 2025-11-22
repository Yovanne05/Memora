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


class CollectionShareTargetDoesNotExist(UnprocessableEntity):
    def __init__(self, description: str = "The target user does not exist."):
        super().__init__(description=description)


class CollectionShareAlreadyExists(Conflict):
    def __init__(
        self,
        description: str = (
            "This collection is already shared with the target user."
        ),
    ):
        super().__init__(description=description)


class CollectionShareNotFound(NotFound):
    def __init__(
        self,
        description: str = (
            "The share configuration for this user was not found."
        ),
    ):
        super().__init__(description=description)


class CollectionShareWithOwnerForbidden(UnprocessableEntity):
    def __init__(
        self,
        description: str = "Sharing a collection with its owner is not allowed.",
    ):
        super().__init__(description=description)

from werkzeug.exceptions import Conflict, NotFound, UnprocessableEntity


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

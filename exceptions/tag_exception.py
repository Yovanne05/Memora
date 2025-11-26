from werkzeug.exceptions import Conflict, NotFound


class TagNotFound(NotFound):
    def __init__(self, description: str = "Tag not found."):
        super().__init__(description=description)


class TagNameConflict(Conflict):
    def __init__(
        self, description: str = "A tag with the same name already exists."
    ):
        super().__init__(description=description)

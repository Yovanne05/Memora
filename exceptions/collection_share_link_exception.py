from werkzeug.exceptions import NotFound


class CollectionShareLinkNotFound(NotFound):
    def __init__(self, description: str = "Share link not found."):
        super().__init__(description=description)

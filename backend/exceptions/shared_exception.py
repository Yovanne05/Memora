from werkzeug.exceptions import NotFound


class SharedResourceNotFound(NotFound):
    def __init__(self, description: str = "Shared resource not found or access denied."):
        super().__init__(description=description)

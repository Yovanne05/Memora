from werkzeug.exceptions import Unauthorized


class InvalidCredentials(Unauthorized):
    def __init__(self, description: str = "Invalid credentials."):
        super().__init__(description=description)

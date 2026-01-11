from werkzeug.exceptions import Unauthorized


class InvalidCredentials(Unauthorized):
    def __init__(self, description: str = "Invalid credentials."):
        super().__init__(description=description)


class AuthenticatedUserNotFound(Unauthorized):
    def __init__(self, description: str = "User not found or deactivated."):
        super().__init__(description=description)

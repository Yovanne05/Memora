from werkzeug.exceptions import Forbidden, Unauthorized


class InvalidCredentials(Unauthorized):
    def __init__(self, description: str = "Invalid credentials."):
        super().__init__(description=description)


class InactiveAccount(Forbidden):
    def __init__(self, description: str = "This account is inactive."):
        super().__init__(description=description)

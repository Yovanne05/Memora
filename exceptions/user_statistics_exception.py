from werkzeug.exceptions import NotFound


class UserStatisticsNotFound(NotFound):
    def __init__(
        self, description: str = "User statistics could not be computed."
    ):
        super().__init__(description=description)

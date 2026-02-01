from werkzeug.exceptions import NotFound


class FavoriteNotFound(NotFound):
    def __init__(self, description: str = "Favorite not found."):
        super().__init__(description=description)

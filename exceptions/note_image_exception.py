from werkzeug.exceptions import BadRequest


class NoFileProvided(BadRequest):
    def __init__(self, description: str = "No file provided."):
        super().__init__(description=description)


class InvalidFileType(BadRequest):
    def __init__(
        self,
        description: str = "File type not allowed. Allowed extensions: jpg, jpeg, png, gif, webp.",
    ):
        super().__init__(description=description)


class FileTooLarge(BadRequest):
    def __init__(self, description: str = "File too large."):
        super().__init__(description=description)

from werkzeug.exceptions import BadRequest, NotFound


class NoteImageNotFound(NotFound):
    def __init__(self, description: str = "Image not found for this note."):
        super().__init__(description=description)


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

from werkzeug.exceptions import BadRequest, NotFound


class UploadsNotAvailable(NotFound):
    def __init__(self, description: str = "Uploads are not available on this storage driver."):
        super().__init__(description=description)


class UploadInvalidKey(BadRequest):
    def __init__(self, description: str = "Invalid upload key."):
        super().__init__(description=description)


class UploadNotFound(NotFound):
    def __init__(self, description: str = "Upload not found."):
        super().__init__(description=description)

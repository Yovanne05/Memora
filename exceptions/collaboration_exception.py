class CollaborationNotAuthorized(Exception):
    def __init__(self):
        super().__init__(
            "User is not authorized to collaborate on this note (requires READ or WRITE permission)"
        )


class CollaborationInvalidOperation(Exception):
    def __init__(self, message: str):
        super().__init__(f"Invalid collaboration operation: {message}")

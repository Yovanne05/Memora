class CollaborationSessionNotFound(Exception):
    """Raised when a collaboration session is not found."""

    def __init__(self):
        super().__init__("Collaboration session not found")


class CollaborationSessionAlreadyExists(Exception):
    """Raised when trying to create a duplicate collaboration session."""

    def __init__(self):
        super().__init__("User already has an active collaboration session on this note")


class CollaborationNotAuthorized(Exception):
    """Raised when a user is not authorized to join a collaboration session."""

    def __init__(self):
        super().__init__(
            "User is not authorized to collaborate on this note (requires READ or WRITE permission)"
        )


class CollaborationVersionConflict(Exception):
    """Raised when there is a version conflict in collaborative operations."""

    def __init__(self, expected_version: int, received_version: int):
        super().__init__(
            f"Version conflict: expected {expected_version}, received {received_version}"
        )


class CollaborationInvalidOperation(Exception):
    """Raised when an invalid collaboration operation is attempted."""

    def __init__(self, message: str):
        super().__init__(f"Invalid collaboration operation: {message}")

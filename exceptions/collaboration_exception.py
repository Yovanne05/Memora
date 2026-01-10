class CollaborationSessionNotFound(Exception):
    def __init__(self):
        super().__init__("Collaboration session not found")


class CollaborationSessionAlreadyExists(Exception):
    def __init__(self):
        super().__init__("User already has an active collaboration session on this note")


class CollaborationNotAuthorized(Exception):
    def __init__(self):
        super().__init__(
            "User is not authorized to collaborate on this note (requires READ or WRITE permission)"
        )


class CollaborationVersionConflict(Exception):
    def __init__(self, expected_version: int, received_version: int):
        self.expected_version = expected_version
        self.received_version = received_version
        super().__init__(
            f"Version conflict: expected {expected_version}, received {received_version}"
        )


class CollaborationInvalidOperation(Exception):
    def __init__(self, message: str):
        super().__init__(f"Invalid collaboration operation: {message}")

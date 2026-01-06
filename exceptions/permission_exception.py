class PermissionException(Exception):
    pass


class InsufficientPermissionException(PermissionException):
    def __init__(
        self,
        resource_type: str = "resource",
        resource_id: str = "",
        required_permission: str = "access",
    ):
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.required_permission = required_permission
        super().__init__(
            f"Insufficient permission to {required_permission} {resource_type}"
            + (f" '{resource_id}'" if resource_id else "")
        )


class ReadPermissionDenied(InsufficientPermissionException):
    def __init__(self, resource_type: str = "resource", resource_id: str = ""):
        super().__init__(resource_type, resource_id, "read")


class WritePermissionDenied(InsufficientPermissionException):
    def __init__(self, resource_type: str = "resource", resource_id: str = ""):
        super().__init__(resource_type, resource_id, "write")


class ManagePermissionDenied(InsufficientPermissionException):
    def __init__(self, resource_type: str = "resource", resource_id: str = ""):
        super().__init__(resource_type, resource_id, "manage")


class ResourceNotFoundException(PermissionException):
    def __init__(self, resource_type: str = "resource", resource_id: str = ""):
        self.resource_type = resource_type
        self.resource_id = resource_id
        super().__init__(
            f"{resource_type.capitalize()} not found"
            + (f": {resource_id}" if resource_id else "")
        )

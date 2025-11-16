from enum import Enum


class VisibilityEnum(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"


class SharePermissionEnum(str, Enum):
    READ = "read"
    WRITE = "write"

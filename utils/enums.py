from enum import Enum


class VisibilityEnum(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"


class SharePermissionEnum(str, Enum):
    READ = "read"
    WRITE = "write"


class RoleEnum(str, Enum):
    CLIENT = "client"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

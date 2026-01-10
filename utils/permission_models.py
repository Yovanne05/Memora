"""
Permission Domain Models
Domain-level representation of access control concepts.
Following DDD principles: entities, value objects, and domain logic.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional

from utils.enums import RoleEnum, SharePermissionEnum, VisibilityEnum


class AccessLevel(Enum):
    """
    Access level hierarchy for resources.
    Represents the permission level a user has on a resource.
    """
    NONE = 0
    READ = auto()
    WRITE = auto()
    OWNER = auto()
    ADMIN = auto()

    def can_read(self) -> bool:
        """Check if this access level allows read operations."""
        return self.value >= AccessLevel.READ.value

    def can_write(self) -> bool:
        """Check if this access level allows write operations."""
        return self.value >= AccessLevel.WRITE.value

    def can_manage(self) -> bool:
        """Check if this access level allows ownership operations (delete, share)."""
        return self.value >= AccessLevel.OWNER.value

    def is_admin(self) -> bool:
        """Check if this is admin-level access."""
        return self == AccessLevel.ADMIN


@dataclass(frozen=True)
class ResourcePermission:
    """
    Value object representing a user's permission on a specific resource.
    Immutable to preserve domain integrity.
    """
    resource_id: str
    resource_type: str  # 'note', 'collection', 'flashcard'
    user_id: str
    access_level: AccessLevel

    def can_read(self) -> bool:
        """Domain rule: can the user read this resource?"""
        return self.access_level.can_read()

    def can_write(self) -> bool:
        """Domain rule: can the user write to this resource?"""
        return self.access_level.can_write()

    def can_manage(self) -> bool:
        """Domain rule: can the user manage this resource (delete, share)?"""
        return self.access_level.can_manage()


@dataclass(frozen=True)
class PermissionContext:
    """
    Context information for permission evaluation.
    Aggregates all data needed to compute permissions.
    """
    user_id: str
    user_role: RoleEnum
    resource_id: str
    resource_type: str
    owner_id: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None
    share_permission: Optional[SharePermissionEnum] = None
    parent_collection_id: Optional[str] = None

    def is_owner(self) -> bool:
        """Domain rule: is the user the owner of this resource?"""
        return self.owner_id is not None and self.user_id == self.owner_id

    def is_admin(self) -> bool:
        """Domain rule: is the user an admin?"""
        return self.user_role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}

    def is_public(self) -> bool:
        """Domain rule: is the resource publicly visible?"""
        return self.visibility == VisibilityEnum.PUBLIC

    def has_direct_share(self) -> bool:
        """Domain rule: does the user have a direct share?"""
        return self.share_permission is not None


def compute_access_level_from_context(context: PermissionContext) -> AccessLevel:
    """
    Core domain logic: compute access level from context.
    This is the single source of truth for permission calculation.

    Priority order:
    1. Admin access (highest)
    2. Ownership
    3. Direct share
    4. Public visibility
    5. No access (default)
    """
    # Admin users have full access
    if context.is_admin():
        return AccessLevel.ADMIN

    # Owner has full control
    if context.is_owner():
        return AccessLevel.OWNER

    # Direct share permissions
    if context.has_direct_share():
        return _share_permission_to_access_level(context.share_permission)

    # Public resources are readable
    if context.is_public():
        return AccessLevel.READ

    # Default: no access
    return AccessLevel.NONE


def _share_permission_to_access_level(permission: Optional[SharePermissionEnum]) -> AccessLevel:
    """
    Convert share permission enum to access level.
    Internal domain mapping function.
    """
    if permission is None:
        return AccessLevel.NONE

    mapping = {
        SharePermissionEnum.READ: AccessLevel.READ,
        SharePermissionEnum.WRITE: AccessLevel.WRITE,
    }
    return mapping.get(permission, AccessLevel.NONE)

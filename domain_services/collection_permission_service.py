from typing import Optional, Set

from domain_services.permission_helpers import cached, is_admin_role
from repositorys.permission_repository import permission_repository
from utils.db import get_db_session
from utils.enums import RoleEnum
from utils.permission_models import (
    AccessLevel,
    ResourcePermission,
    compute_access_level_from_context,
)


class CollectionPermissionService:
    def get_collection_permission(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> ResourcePermission:
        if is_admin_role(user_role):
            return ResourcePermission(
                resource_id=collection_id,
                resource_type="collection",
                user_id=user_id,
                access_level=AccessLevel.WRITE,
            )

        with get_db_session() as session:
            context = permission_repository.get_collection_permission_context(
                session, collection_id, user_id
            )

            if context is None:
                return ResourcePermission(
                    resource_id=collection_id,
                    resource_type="collection",
                    user_id=user_id,
                    access_level=AccessLevel.NONE,
                )

            access_level = compute_access_level_from_context(context)
            return ResourcePermission(
                resource_id=collection_id,
                resource_type="collection",
                user_id=user_id,
                access_level=access_level,
            )

    def get_accessible_collection_ids(
        self, user_id: str, user_role: RoleEnum
    ) -> Optional[Set[str]]:
        if is_admin_role(user_role):
            return None  # Admin can access everything

        return cached(
            f"accessible_collection_ids:{user_id}",
            lambda: self._load_accessible_collection_ids(user_id),
        )

    def can_read_collection(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        permission = self.get_collection_permission(
            collection_id, user_id, user_role
        )
        return permission.can_read()

    def can_write_collection(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        permission = self.get_collection_permission(
            collection_id, user_id, user_role
        )
        return permission.can_write()

    def _load_accessible_collection_ids(self, user_id: str) -> Set[str]:
        with get_db_session() as session:
            return permission_repository.get_accessible_collection_ids(
                session, user_id
            )

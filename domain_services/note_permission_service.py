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


class NotePermissionService:
    def get_note_permission(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> ResourcePermission:
        if is_admin_role(user_role):
            return ResourcePermission(
                resource_id=note_id,
                resource_type="note",
                user_id=user_id,
                access_level=AccessLevel.WRITE,
            )

        with get_db_session() as session:
            context = permission_repository.get_note_permission_context(
                session, note_id, user_id
            )

            if context is None:
                return ResourcePermission(
                    resource_id=note_id,
                    resource_type="note",
                    user_id=user_id,
                    access_level=AccessLevel.NONE,
                )

            access_level = compute_access_level_from_context(context)
            return ResourcePermission(
                resource_id=note_id,
                resource_type="note",
                user_id=user_id,
                access_level=access_level,
            )

    def get_accessible_note_ids(
        self, user_id: str, user_role: RoleEnum
    ) -> Optional[Set[str]]:
        if is_admin_role(user_role):
            return None

        return cached(
            f"accessible_note_ids:{user_id}",
            lambda: self._load_accessible_note_ids(user_id),
        )

    def can_read_note(self, note_id: str, user_id: str, user_role: RoleEnum) -> bool:
        permission = self.get_note_permission(note_id, user_id, user_role)
        return permission.can_read()

    def can_write_note(self, note_id: str, user_id: str, user_role: RoleEnum) -> bool:
        permission = self.get_note_permission(note_id, user_id, user_role)
        return permission.can_write()

    def get_note_ids_in_collections(self, collection_ids: Set[str]) -> Set[str]:
        with get_db_session() as session:
            return permission_repository.get_note_ids_in_collections(
                session, collection_ids
            )

    def _load_accessible_note_ids(self, user_id: str) -> Set[str]:
        with get_db_session() as session:
            return permission_repository.get_accessible_note_ids(session, user_id)

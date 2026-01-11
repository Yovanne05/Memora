from typing import Optional, Set

from flask import g

from utils.permission_models import (
    AccessLevel,
    ResourcePermission,
    compute_access_level_from_context,
)
from repositorys.permission_repository import permission_repository
from utils.db import get_db_session
from utils.enums import RoleEnum


class PermissionDomainService:

    def get_note_permission(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> ResourcePermission:
        if self._is_admin_role(user_role):
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

    def get_collection_permission(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> ResourcePermission:
        if self._is_admin_role(user_role):
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

    def get_accessible_note_ids(
        self, user_id: str, user_role: RoleEnum
    ) -> Optional[Set[str]]:
        if self._is_admin_role(user_role):
            return None

        return self._cached(
            f"accessible_note_ids:{user_id}",
            lambda: self._load_accessible_note_ids(user_id),
        )

    def get_accessible_collection_ids(
        self, user_id: str, user_role: RoleEnum
    ) -> Optional[Set[str]]:
        if self._is_admin_role(user_role):
            return None  # Admin can access everything

        return self._cached(
            f"accessible_collection_ids:{user_id}",
            lambda: self._load_accessible_collection_ids(user_id),
        )

    def can_read_note(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        permission = self.get_note_permission(note_id, user_id, user_role)
        return permission.can_read()

    def can_write_note(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        permission = self.get_note_permission(note_id, user_id, user_role)
        return permission.can_write()

    def can_read_collection(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        permission = self.get_collection_permission(collection_id, user_id, user_role)
        return permission.can_read()

    def can_write_collection(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        permission = self.get_collection_permission(collection_id, user_id, user_role)
        return permission.can_write()

    def can_read_flashcard(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        return self.can_read_note(note_id, user_id, user_role)

    def get_note_ids_in_collections(self, collection_ids: Set[str]) -> Set[str]:
        with get_db_session() as session:
            return permission_repository.get_note_ids_in_collections(
                session, collection_ids
            )

    @staticmethod
    def _is_admin_role(role: RoleEnum) -> bool:
        return role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}

    def _load_accessible_note_ids(self, user_id: str) -> Set[str]:
        with get_db_session() as session:
            return permission_repository.get_accessible_note_ids(session, user_id)

    def _load_accessible_collection_ids(self, user_id: str) -> Set[str]:
        with get_db_session() as session:
            return permission_repository.get_accessible_collection_ids(
                session, user_id
            )

    @staticmethod
    def _cached(cache_key: str, loader):
        if hasattr(g, cache_key):
            return getattr(g, cache_key)
        value = loader()
        setattr(g, cache_key, value)
        return value


permission_domain_service = PermissionDomainService()

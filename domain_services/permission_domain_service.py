from typing import Optional, Set

from domain_services.collection_permission_service import CollectionPermissionService
from domain_services.note_permission_service import NotePermissionService
from utils.enums import RoleEnum
from utils.permission_models import ResourcePermission


class PermissionDomainService:
    def __init__(self):
        self._note_permissions = NotePermissionService()
        self._collection_permissions = CollectionPermissionService()

    def get_note_permission(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> ResourcePermission:
        return self._note_permissions.get_note_permission(note_id, user_id, user_role)

    def get_collection_permission(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> ResourcePermission:
        return self._collection_permissions.get_collection_permission(
            collection_id, user_id, user_role
        )

    def get_accessible_note_ids(
        self, user_id: str, user_role: RoleEnum, include_public: bool = False
    ) -> Optional[Set[str]]:
        return self._note_permissions.get_accessible_note_ids(
            user_id, user_role, include_public=include_public
        )

    def get_accessible_collection_ids(
        self, user_id: str, user_role: RoleEnum, include_public: bool = False
    ) -> Optional[Set[str]]:
        return self._collection_permissions.get_accessible_collection_ids(
            user_id, user_role, include_public=include_public
        )

    def can_read_note(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        return self._note_permissions.can_read_note(note_id, user_id, user_role)

    def can_write_note(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        return self._note_permissions.can_write_note(note_id, user_id, user_role)

    def can_read_collection(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        return self._collection_permissions.can_read_collection(
            collection_id, user_id, user_role
        )

    def can_write_collection(
        self, collection_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        return self._collection_permissions.can_write_collection(
            collection_id, user_id, user_role
        )

    def can_read_flashcard(
        self, note_id: str, user_id: str, user_role: RoleEnum
    ) -> bool:
        return self.can_read_note(note_id, user_id, user_role)

    def get_note_ids_in_collections(self, collection_ids: Set[str]) -> Set[str]:
        return self._note_permissions.get_note_ids_in_collections(collection_ids)


permission_domain_service = PermissionDomainService()

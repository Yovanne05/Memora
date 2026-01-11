from functools import wraps
from typing import Callable, Literal

from flask import abort

from domain_services.permission_domain_service import permission_domain_service
from exceptions.permission_exception import (
    ReadPermissionDenied,
    WritePermissionDenied,
)
from exceptions.user_exception import UserPermissionDenied
from utils.auth import get_current_user
from utils.enums import RoleEnum


ResourceType = Literal["note", "collection"]
PermissionLevel = Literal["read", "write"]


def _is_admin(role) -> bool:
    if isinstance(role, RoleEnum):
        return role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}
    return role in {RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value}


def require_permission(
    resource_type: ResourceType,
    permission_level: PermissionLevel,
    resource_id_param: str = "id",
):
 
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            resource_id = kwargs.get(resource_id_param)
            if resource_id is None:
                abort(500, f"Missing route parameter: {resource_id_param}")

            resource_id = str(resource_id)

            user = get_current_user()
            user_id = user.id
            user_role = user.role

            has_permission = False

            if resource_type == "note":
                if permission_level == "read":
                    has_permission = permission_domain_service.can_read_note(
                        resource_id, user_id, user_role
                    )
                elif permission_level == "write":
                    has_permission = permission_domain_service.can_write_note(
                        resource_id, user_id, user_role
                    )

            elif resource_type == "collection":
                if permission_level == "read":
                    has_permission = permission_domain_service.can_read_collection(
                        resource_id, user_id, user_role
                    )
                elif permission_level == "write":
                    has_permission = permission_domain_service.can_write_collection(
                        resource_id, user_id, user_role
                    )

            if not has_permission:
                if permission_level == "read":
                    raise ReadPermissionDenied(resource_type, resource_id)
                elif permission_level == "write":
                    raise WritePermissionDenied(resource_type, resource_id)

            return func(*args, **kwargs)

        return wrapper

    return decorator


def require_note_read(resource_id_param: str = "note_id"):
    return require_permission("note", "read", resource_id_param)


def require_note_write(resource_id_param: str = "note_id"):
    return require_permission("note", "write", resource_id_param)


def require_collection_read(resource_id_param: str = "collection_id"):
    return require_permission("collection", "read", resource_id_param)


def require_collection_write(resource_id_param: str = "collection_id"):
    return require_permission("collection", "write", resource_id_param)


def require_owner(resource_type: ResourceType, resource_id_param: str = "id"):
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            resource_id = kwargs.get(resource_id_param)
            if resource_id is None:
                abort(500, f"Missing route parameter: {resource_id_param}")

            user = get_current_user()
            owner_id = None

            if resource_type == "note":
                from repositorys import note_repository
                entity = note_repository.find_one_unscoped(str(resource_id))
                if entity:
                    owner_id = entity.owner_id
            elif resource_type == "collection":
                from repositorys import collection_repository
                entity = collection_repository.find_one_unscoped(str(resource_id))
                if entity:
                    owner_id = entity.owner_id

            if owner_id is not None and str(owner_id) != str(user.id):
                raise UserPermissionDenied()

            return func(*args, **kwargs)

        return wrapper

    return decorator


def require_self_or_admin(user_id_param: str = "user_id"):
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user_id = kwargs.get(user_id_param)
            if user_id is None:
                abort(500, f"Missing route parameter: {user_id_param}")

            user = get_current_user()
            if str(user_id) != str(user.id) and not _is_admin(user.role):
                raise UserPermissionDenied()

            return func(*args, **kwargs)

        return wrapper

    return decorator

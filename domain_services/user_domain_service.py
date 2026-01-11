from daos.user_dao import User
from dtos.user_dto import UserUpdateDTO
from exceptions.user_exception import (
    UserEmailConflict,
    UserNotFound,
    UserPermissionDenied,
    UserUsernameConflict,
)
from utils.enums import RoleEnum
from utils.logger import logger


def apply_user_update(user_entity: User, user_update_dto: UserUpdateDTO) -> User:
    if user_update_dto.email is not None:
        user_entity.email = user_update_dto.email

    if "username" in user_update_dto.model_fields_set:
        user_entity.username = user_update_dto.username

    if user_update_dto.role is not None:
        user_entity.role = user_update_dto.role

    return user_entity


def ensure_user_exists(user_entity) -> User:
    if not user_entity:
        raise UserNotFound()
    return user_entity


def ensure_unique_email(existing_user, exclude_id: str | None = None) -> None:
    if existing_user and existing_user.id != exclude_id:
        raise UserEmailConflict()


def ensure_unique_username(existing_user, exclude_id: str | None = None) -> None:
    if existing_user and existing_user.id != exclude_id:
        raise UserUsernameConflict()


def validate_role_change(
    user_update_dto: UserUpdateDTO,
    user_entity: User,
    actor_role: RoleEnum | str,
) -> None:
    if user_update_dto.role is None:
        return

    if not _is_admin_role(actor_role):
        raise UserPermissionDenied("Only admins can change roles.")

    new_role = user_update_dto.role
    if isinstance(new_role, str):
        new_role = RoleEnum(new_role)

    # Only SUPER_ADMIN can assign or modify ADMIN/SUPER_ADMIN roles
    # or modify users who already have ADMIN/SUPER_ADMIN role
    is_setting_privileged = new_role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}
    is_current_privileged = user_entity.role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}

    if (is_setting_privileged or is_current_privileged) and actor_role != RoleEnum.SUPER_ADMIN:
        raise UserPermissionDenied(
            "Only super admins can assign or modify the ADMIN or SUPER_ADMIN roles."
        )

    if user_update_dto.role != user_entity.role:
        logger.info(
            f"Role change target_id={user_entity.id} from={user_entity.role} to={user_update_dto.role}"
        )


def _is_admin_role(role: RoleEnum | str) -> bool:
    if isinstance(role, RoleEnum):
        return role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}
    return role in {RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value}

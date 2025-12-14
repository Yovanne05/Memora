from daos.user_dao import User
from dtos.user_dto import UserUpdateDTO


def apply_user_update(user_entity: User, user_update_dto: UserUpdateDTO) -> User:
    if user_update_dto.email is not None:
        user_entity.email = user_update_dto.email

    if "username" in user_update_dto.model_fields_set:
        user_entity.username = user_update_dto.username

    if "display_name" in user_update_dto.model_fields_set:
        user_entity.display_name = user_update_dto.display_name

    if user_update_dto.role is not None:
        user_entity.role = user_update_dto.role

    if "is_active" in user_update_dto.model_fields_set:
        user_entity.is_active = user_update_dto.is_active

    return user_entity

from daos.user_dao import User
from dtos.user_dto import UserUpdateDTO


def apply_user_update(user_entity: User, user_update_dto: UserUpdateDTO) -> User:
    if user_update_dto.email is not None:
        user_entity.email = user_update_dto.email

    if "username" in user_update_dto.model_fields_set:
        user_entity.username = user_update_dto.username

    if user_update_dto.role is not None:
        user_entity.role = user_update_dto.role

    return user_entity

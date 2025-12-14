from daos.user_dao import User
from dtos.user_dto import UserCreateDTO, UserDTO


def user_to_dto(user_entity: User) -> UserDTO:
    return UserDTO.model_validate(user_entity)


def dto_to_user(user_create_dto: UserCreateDTO, password_hash: str) -> User:
    return User(
        email=user_create_dto.email,
        username=user_create_dto.username,
        display_name=user_create_dto.display_name,
        password_hash=password_hash,
        role=user_create_dto.role,
        is_active=user_create_dto.is_active,
    )

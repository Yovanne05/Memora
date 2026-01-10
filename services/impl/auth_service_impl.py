from datetime import datetime, timezone
from typing import Tuple

from flask_jwt_extended import create_access_token

from dtos.auth_dto import LoginDTO, RegisterDTO
from dtos.user_dto import UserCreateDTO, UserDTO
from exceptions.auth_exception import InvalidCredentials
from exceptions.user_exception import UserNotFound
from mappers.user_mapper import user_to_dto
from repositorys import user_repository
from services.impl.user_service_impl import user_service
from services.interfaces.auth_service_interface import AuthServiceInterface
from utils.enums import RoleEnum
from utils.security import verify_password


class AuthService(AuthServiceInterface):
    def register(self, register_dto: RegisterDTO) -> Tuple[UserDTO, str]:
        user_create = UserCreateDTO(
            email=register_dto.email,
            password=register_dto.password,
            username=register_dto.username,
            role=RoleEnum.CLIENT,
        )
        user = user_service.create(user_create)
        token = self._create_token(user.id, user.role.value, user.email)
        return user, token

    def login(self, login_dto: LoginDTO) -> Tuple[UserDTO, str]:
        user_entity = user_repository.find_one_by_identifier(
            login_dto.identifier
        )
        if not user_entity:
            raise InvalidCredentials()

        if not verify_password(login_dto.password, user_entity.password_hash):
            raise InvalidCredentials()

        user_entity.last_login = datetime.now(timezone.utc)
        saved = user_repository.update(user_entity)
        user_dto = user_to_dto(saved)
        token = self._create_token(saved.id, saved.role.value, saved.email)
        return user_dto, token

    def get_me(self, user_id: str) -> UserDTO:
        user_entity = user_repository.find_one(user_id)
        if not user_entity:
            raise UserNotFound()
        return user_to_dto(user_entity)

    def _create_token(self, user_id: str, role: str, email: str) -> str:
        return create_access_token(
            identity=user_id,
            additional_claims={"role": role, "email": email},
        )


auth_service = AuthService()

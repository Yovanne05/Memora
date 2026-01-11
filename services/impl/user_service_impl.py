from typing import List, Optional, Tuple

import bcrypt

from domain_services.user_domain_service import apply_user_update
from dtos.user_dto import UserCreateDTO, UserDTO, UserUpdateDTO
from exceptions.user_exception import (
    UserEmailConflict,
    UserNotFound,
    UserUsernameConflict,
    UserPermissionDenied,
)
from mappers.user_mapper import dto_to_user, user_to_dto
from repositorys import user_repository
from repositorys.user_repository import UserSearchParams
from services.interfaces.user_service_interface import UserServiceInterface
from utils.enums import RoleEnum
from utils.logger import logger


class UserService(UserServiceInterface):
    def find_many(
        self, params: Optional[UserSearchParams] = None
    ) -> Tuple[List[UserDTO], int]:
        entities, total = user_repository.find_many(params)
        return [user_to_dto(entity) for entity in entities], total

    def find_one(self, user_id: str) -> UserDTO:
        user_entity = user_repository.find_one(user_id)
        if not user_entity:
            raise UserNotFound()
        return user_to_dto(user_entity)

    def create(self, user_create_dto: UserCreateDTO) -> UserDTO:
        self._ensure_unique_email(user_create_dto.email)
        if user_create_dto.username:
            self._ensure_unique_username(user_create_dto.username)

        password_hash = self._hash_password(user_create_dto.password)
        entity = dto_to_user(user_create_dto, password_hash)
        saved = user_repository.add(entity)
        return user_to_dto(saved)

    def update(
        self,
        user_id: str,
        user_update_dto: UserUpdateDTO,
        actor_role: RoleEnum | str,
    ) -> UserDTO:
        user_entity = user_repository.find_one(user_id)
        if not user_entity:
            raise UserNotFound()

        if user_update_dto.role is not None and not self._is_admin_role(actor_role):
            raise UserPermissionDenied("Only admins can change roles.")

        if user_update_dto.role is not None and user_update_dto.role != user_entity.role:
            logger.info(
                "Role change target_id=%s from=%s to=%s",
                user_entity.id,
                user_entity.role,
                user_update_dto.role,
            )

        if user_update_dto.email is not None:
            self._ensure_unique_email(
                user_update_dto.email, exclude_id=user_entity.id
            )

        if (
            "username" in user_update_dto.model_fields_set
            and user_update_dto.username
        ):
            self._ensure_unique_username(
                user_update_dto.username, exclude_id=user_entity.id
            )

        updated_entity = apply_user_update(user_entity, user_update_dto)

        if user_update_dto.password is not None:
            logger.info(
                "Password change target_id=%s",
                user_entity.id,
            )
            updated_entity.password_hash = self._hash_password(
                user_update_dto.password
            )

        saved = user_repository.update(updated_entity)
        return user_to_dto(saved)

    def delete(self, user_id: str) -> None:
        deleted = user_repository.delete(user_id)
        if not deleted:
            raise UserNotFound()

    def _hash_password(self, raw_password: str) -> str:
        hashed = bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt())
        return hashed.decode("utf-8")

    def _ensure_unique_email(self, email: str, exclude_id: str | None = None) -> None:
        existing = user_repository.find_one_by_email(email)
        if existing and existing.id != exclude_id:
            raise UserEmailConflict()

    def _ensure_unique_username(
        self, username: str, exclude_id: str | None = None
    ) -> None:
        existing = user_repository.find_one_by_username(username)
        if existing and existing.id != exclude_id:
            raise UserUsernameConflict()

    @staticmethod
    def _is_admin_role(role: RoleEnum | str) -> bool:
        if isinstance(role, RoleEnum):
            return role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}
        return role in {RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value}


user_service = UserService()

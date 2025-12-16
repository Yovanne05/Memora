from typing import List, Optional, Protocol, Tuple

from dtos.user_dto import UserCreateDTO, UserDTO, UserUpdateDTO
from repositorys.user_repository import UserSearchParams


class UserServiceInterface(Protocol):
    def find_many(
        self, params: Optional[UserSearchParams] = None
    ) -> Tuple[List[UserDTO], int]:
        """Protocol method - implemented by concrete service"""
        ...

    def find_one(self, user_id: str) -> UserDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def create(self, user_create_dto: UserCreateDTO) -> UserDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def update(self, user_id: str, user_update_dto: UserUpdateDTO) -> UserDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def delete(self, user_id: str) -> None:
        """Protocol method - implemented by concrete service"""
        ...

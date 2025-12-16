from typing import Protocol, Tuple

from dtos.auth_dto import LoginDTO, RegisterDTO
from dtos.user_dto import UserDTO


class AuthServiceInterface(Protocol):
    def register(self, register_dto: RegisterDTO) -> Tuple[UserDTO, str]:
        """Protocol method - implemented by concrete service"""
        ...

    def login(self, login_dto: LoginDTO) -> Tuple[UserDTO, str]:
        """Protocol method - implemented by concrete service"""
        ...

    def get_me(self, user_id: str) -> UserDTO:
        """Protocol method - implemented by concrete service"""
        ...

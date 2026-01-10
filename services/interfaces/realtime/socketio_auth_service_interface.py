from typing import Protocol

from utils.enums import RoleEnum


class SocketIOAuthServiceInterface(Protocol):
    def get_current_user_context_from_socket(
        self, auth=None
    ) -> tuple[str | None, RoleEnum | None]:
        ...

    def get_current_user_from_socket(self, auth=None) -> str | None:
        ...

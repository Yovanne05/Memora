from typing import Protocol

from dtos.collaboration_dto import (
    CollaborationEventDTO,
    CollaborationSessionDTO,
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
)
from utils.enums import RoleEnum


class RealtimeCollaborationServiceInterface(Protocol):
    def get_username_by_socket(self, socket_id: str) -> str:
        ...

    def join_collaboration_session(
        self,
        note_id: str,
        user_id: str,
        user_role: RoleEnum,
        socket_id: str,
        initial_content: str | None = None,
    ) -> tuple[CollaborationSessionDTO, CollaborationEventDTO]:
        ...

    def leave_collaboration_session(
        self, note_id: str, user_id: str, socket_id: str
    ) -> CollaborationEventDTO | None:
        ...

    def handle_disconnect(self, socket_id: str) -> CollaborationEventDTO | None:
        ...

    def process_crdt_update(
        self,
        update_dto: CRDTUpdateDTO,
        user_id: str,
        user_role: RoleEnum,
        username: str,
    ) -> CollaborationEventDTO:
        ...

    def handle_crdt_sync_request(
        self, sync_request_dto: CRDTSyncRequestDTO, user_id: str, user_role: RoleEnum
    ) -> tuple[str, str]:
        ...

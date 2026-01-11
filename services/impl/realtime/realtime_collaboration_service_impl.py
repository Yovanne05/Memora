from domain_services.realtime_collaboration_domain_service import (
    DEFAULT_EMPTY_DOCUMENT,
    build_crdt_update_event,
    build_join_event,
    build_leave_event,
    build_session_dto,
    decode_base64,
    encode_base64,
    ensure_can_read,
    ensure_can_write,
)
from dtos.collaboration_dto import (
    CollaborationEventDTO,
    CollaborationSessionDTO,
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
)
from exceptions.collaboration_exception import CollaborationInvalidOperation
from services.interfaces.realtime.realtime_collaboration_service_interface import (
    RealtimeCollaborationServiceInterface,
)
from services.impl.realtime.collaboration_data_service import (
    CollaborationDataService,
)
from services.impl.realtime.collaboration_session_manager import (
    CollaborationSessionManager,
)
from services.impl.realtime.crdt_document_coordinator import (
    CRDTDocumentCoordinator,
)
from services.interfaces.realtime.collaboration_data_service_interface import (
    CollaborationDataServiceInterface,
)
from services.interfaces.realtime.collaboration_session_manager_interface import (
    CollaborationSessionManagerInterface,
)
from services.interfaces.realtime.crdt_document_coordinator_interface import (
    CRDTDocumentCoordinatorInterface,
)
from utils.enums import RoleEnum


class RealtimeCollaborationService(RealtimeCollaborationServiceInterface):
    def __init__(
        self,
        data_service: CollaborationDataServiceInterface | None = None,
        session_manager: CollaborationSessionManagerInterface | None = None,
        crdt_coordinator: CRDTDocumentCoordinatorInterface | None = None,
    ):
        self._data_service = data_service or CollaborationDataService()
        self._session_manager = session_manager or CollaborationSessionManager()
        self._crdt_coordinator = crdt_coordinator or CRDTDocumentCoordinator()

    def get_username_by_socket(self, socket_id: str) -> str:
        return self._session_manager.get_username_by_socket(socket_id)

    def join_collaboration_session(
        self,
        note_id: str,
        user_id: str,
        user_role: RoleEnum,
        socket_id: str,
        initial_content: str | None = None,
    ) -> tuple[CollaborationSessionDTO, CollaborationEventDTO]:
        note = self._data_service.get_note_or_raise(note_id)
        ensure_can_read(note_id, user_id, user_role)
        user = self._data_service.get_user_or_raise(user_id)
        username = user.username

        note_content = self._data_service.resolve_and_persist_content(
            note_id, note, initial_content
        )
        self._crdt_coordinator.ensure_document(note_id, note_content)

        all_sessions = self._session_manager.register_session(
            note_id, user_id, socket_id, username
        )
        session_dto = build_session_dto(note_id, all_sessions)
        join_event = build_join_event(note_id, user_id, username)

        return session_dto, join_event

    def leave_collaboration_session(
        self, note_id: str, user_id: str, socket_id: str
    ) -> CollaborationEventDTO | None:
        session_data = self._session_manager.pop_session(socket_id)
        if not session_data:
            return None

        resolved_note_id = session_data.get("note_id") or note_id
        username = session_data.get("username", "Unknown")

        return build_leave_event(resolved_note_id, user_id, username)

    def handle_disconnect(self, socket_id: str) -> CollaborationEventDTO | None:
        session_data = self._session_manager.pop_session(socket_id)
        if not session_data:
            return None

        note_id = session_data.get("note_id")
        user_id = session_data.get("user_id")
        username = session_data.get("username", "Unknown")

        return build_leave_event(note_id, user_id, username)

    def process_crdt_update(
        self,
        update_dto: CRDTUpdateDTO,
        user_id: str,
        user_role: RoleEnum,
        username: str,
    ) -> CollaborationEventDTO:
        ensure_can_write(update_dto.note_id, user_id, user_role)

        update_bytes = decode_base64(update_dto.update, "update")
        note = self._data_service.get_note_or_raise(update_dto.note_id)
        seed_content = note.content or DEFAULT_EMPTY_DOCUMENT
        try:
            self._crdt_coordinator.apply_update(
                update_dto.note_id, update_bytes, seed_content
            )
        except Exception as exc:
            raise CollaborationInvalidOperation("Invalid CRDT update") from exc

        raw_content = self._crdt_coordinator.get_text(
            update_dto.note_id, seed_content
        )
        fallback_content = self._data_service.normalize_content(
            note.content, fallback=DEFAULT_EMPTY_DOCUMENT
        )
        safe_content = self._data_service.normalize_content(
            raw_content, fallback=fallback_content
        )
        self._crdt_coordinator.resync_if_diverged(
            update_dto.note_id, safe_content, raw_content
        )
        self._data_service.update_content_if_changed(
            update_dto.note_id, note, safe_content
        )

        return build_crdt_update_event(
            update_dto.note_id, user_id, username, update_dto.update
        )

    def handle_crdt_sync_request(
        self, sync_request_dto: CRDTSyncRequestDTO, user_id: str, user_role: RoleEnum
    ) -> tuple[str, str]:
        ensure_can_read(sync_request_dto.note_id, user_id, user_role)

        client_state_vector = decode_base64(
            sync_request_dto.state_vector, "state vector"
        )

        note = self._data_service.get_note_or_raise(sync_request_dto.note_id)
        seed_content = self._data_service.normalize_content(
            note.content, fallback=DEFAULT_EMPTY_DOCUMENT
        )
        try:
            server_state_vector, update_bytes = self._crdt_coordinator.get_sync_payload(
                sync_request_dto.note_id, client_state_vector, seed_content
            )
        except Exception as exc:
            raise CollaborationInvalidOperation("Invalid state vector") from exc

        return encode_base64(server_state_vector), encode_base64(update_bytes)


realtime_collaboration_service = RealtimeCollaborationService()

from domain_services.collaboration_session_service import (
    get_collaboration_session_service,
)
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
    ensure_note_exists,
    ensure_user_exists,
    resolve_note_content,
)
from dtos.collaboration_dto import (
    CollaborationEventDTO,
    CollaborationSessionDTO,
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
)
from exceptions.collaboration_exception import CollaborationInvalidOperation
from repositorys import note_repository, user_repository
from services.interfaces.realtime.realtime_collaboration_service_interface import (
    RealtimeCollaborationServiceInterface,
)
from utils.crdt_service import get_crdt_service
from utils.enums import RoleEnum


class RealtimeCollaborationService(RealtimeCollaborationServiceInterface):
    def get_username_by_socket(self, socket_id: str) -> str:
        session_service = get_collaboration_session_service()
        session_data = session_service.find_session_by_socket(socket_id)
        return session_data.get("username") if session_data else "Unknown"

    def join_collaboration_session(
        self,
        note_id: str,
        user_id: str,
        user_role: RoleEnum,
        socket_id: str,
        initial_content: str | None = None,
    ) -> tuple[CollaborationSessionDTO, CollaborationEventDTO]:
        note = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note)
        ensure_can_read(note_id, user_id, user_role)

        user = user_repository.find_one(user_id)
        ensure_user_exists(user)
        username = user.username

        note_content = resolve_note_content(note.content, initial_content)
        if note.content != note_content:
            note.content = note_content
            note_repository.update(note)

        crdt_service = get_crdt_service()
        crdt_service.get_or_create_document(note_id, note_content)

        session_service = get_collaboration_session_service()
        session_service.cleanup_user_sessions(note_id, user_id)
        session_service.create_session(note_id, user_id, socket_id, username)

        all_sessions = session_service.list_sessions_by_note(note_id)
        session_dto = build_session_dto(note_id, all_sessions)
        join_event = build_join_event(note_id, user_id, username)

        return session_dto, join_event

    def leave_collaboration_session(
        self, note_id: str, user_id: str, socket_id: str
    ) -> CollaborationEventDTO | None:
        session_service = get_collaboration_session_service()
        session_data = session_service.find_session_by_socket(socket_id)
        if not session_data:
            return None

        session_service.delete_session_by_socket(socket_id)

        resolved_note_id = session_data.get("note_id") or note_id
        username = session_data.get("username", "Unknown")

        return build_leave_event(resolved_note_id, user_id, username)

    def handle_disconnect(self, socket_id: str) -> CollaborationEventDTO | None:
        session_service = get_collaboration_session_service()
        session_data = session_service.find_session_by_socket(socket_id)
        if not session_data:
            return None

        note_id = session_data.get("note_id")
        user_id = session_data.get("user_id")
        username = session_data.get("username", "Unknown")

        session_service.delete_session_by_socket(socket_id)

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
        crdt_service = get_crdt_service()

        note = note_repository.find_one_unscoped(update_dto.note_id)
        ensure_note_exists(note)

        crdt_service.get_or_create_document(
            update_dto.note_id, note.content or DEFAULT_EMPTY_DOCUMENT
        )
        try:
            crdt_service.apply_update(update_dto.note_id, update_bytes)
        except Exception as exc:
            raise CollaborationInvalidOperation("Invalid CRDT update") from exc

        note.content = crdt_service.get_content_as_text(update_dto.note_id)
        note_repository.update(note)

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

        crdt_service = get_crdt_service()
        note = note_repository.find_one_unscoped(sync_request_dto.note_id)
        ensure_note_exists(note)

        crdt_service.get_or_create_document(
            sync_request_dto.note_id, note.content or DEFAULT_EMPTY_DOCUMENT
        )

        try:
            update_bytes = crdt_service.get_update_since_state(
                sync_request_dto.note_id, client_state_vector
            )
        except Exception as exc:
            raise CollaborationInvalidOperation("Invalid state vector") from exc

        server_state_vector = crdt_service.get_state_vector(sync_request_dto.note_id)

        return encode_base64(server_state_vector), encode_base64(update_bytes)


realtime_collaboration_service = RealtimeCollaborationService()

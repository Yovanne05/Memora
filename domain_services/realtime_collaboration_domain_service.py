from datetime import datetime, timezone
import base64

from daos.note_dao import Note
from daos.user_dao import User
from dtos.collaboration_dto import (
    CollaboratorDTO,
    CollaborationEventDTO,
    CollaborationSessionDTO,
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
)
from exceptions.collaboration_exception import (
    CollaborationInvalidOperation,
    CollaborationNotAuthorized,
)
from domain_services.permission_domain_service import permission_domain_service
from domain_services.collaboration_session_service import get_collaboration_session_service
from utils.db import get_db_session
from utils.enums import RoleEnum
from utils.crdt_service import get_crdt_service

DEFAULT_EMPTY_DOCUMENT = '{"type":"doc","content":[{"type":"paragraph"}]}'


class RealtimeCollaborationDomainService:
    def join_collaboration_session(
        self,
        note_id: str,
        user_id: str,
        user_role: RoleEnum,
        socket_id: str,
        initial_content: str | None = None,
    ) -> tuple[CollaborationSessionDTO, CollaborationEventDTO]:
        with get_db_session() as session:
            note = session.get(Note, note_id)
            if not note:
                raise ValueError("Note not found")

            if not (note.content or "").strip():
                note.content = initial_content or DEFAULT_EMPTY_DOCUMENT

            has_permission = permission_domain_service.can_read_note(
                note_id, user_id, user_role
            )
            if not has_permission:
                raise CollaborationNotAuthorized()

            user = session.get(User, user_id)
            if not user:
                raise ValueError("User not found")
            username = user.username
            note_content = note.content

        crdt_service = get_crdt_service()
        crdt_service.get_or_create_document(note_id, note_content)

        session_service = get_collaboration_session_service()
        session_service.cleanup_user_sessions(note_id, user_id)
        session_service.create_session(note_id, user_id, socket_id, username)

        all_sessions = session_service.list_sessions_by_note(note_id)
        session_dto = self._build_session_dto(note_id, all_sessions)

        join_event = CollaborationEventDTO(
            event_type="user_joined",
            user_id=user_id,
            username=username,
            note_id=note_id,
        )

        return session_dto, join_event

    def leave_collaboration_session(
        self, note_id: str, user_id: str, socket_id: str
    ) -> CollaborationEventDTO | None:
        session_service = get_collaboration_session_service()
        session_data = session_service.find_session_by_socket(socket_id)
        if not session_data:
            return None

        session_service.delete_session_by_socket(socket_id)

        return CollaborationEventDTO(
            event_type="user_left",
            user_id=user_id,
            username=session_data.get("username", "Unknown"),
            note_id=note_id,
        )

    def handle_disconnect(self, socket_id: str) -> CollaborationEventDTO | None:
        session_service = get_collaboration_session_service()
        session_data = session_service.find_session_by_socket(socket_id)
        if not session_data:
            return None

        note_id = session_data.get("note_id")
        user_id = session_data.get("user_id")
        username = session_data.get("username")

        session_service.delete_session_by_socket(socket_id)

        return CollaborationEventDTO(
            event_type="user_left",
            user_id=user_id,
            username=username,
            note_id=note_id,
        )

    def process_crdt_update(
        self, update_dto: CRDTUpdateDTO, user_id: str, user_role: RoleEnum
    ) -> CollaborationEventDTO:
        has_permission = permission_domain_service.can_write_note(
            update_dto.note_id, user_id, user_role
        )
        if not has_permission:
            raise CollaborationNotAuthorized()

        update_bytes = self._decode_base64(update_dto.update, "update")
        crdt_service = get_crdt_service()

        with get_db_session() as session:
            note = session.get(Note, update_dto.note_id)
            if not note:
                raise ValueError("Note not found")

            crdt_service.get_or_create_document(
                update_dto.note_id, note.content or DEFAULT_EMPTY_DOCUMENT
            )
            try:
                crdt_service.apply_update(update_dto.note_id, update_bytes)
            except Exception as exc:
                raise CollaborationInvalidOperation("Invalid CRDT update") from exc
            note.content = crdt_service.get_content_as_text(update_dto.note_id)

        return CollaborationEventDTO(
            event_type="crdt_update",
            user_id=user_id,
            username="",
            note_id=update_dto.note_id,
            crdt_update=update_dto.update,
        )

    def handle_crdt_sync_request(
        self, sync_request_dto: CRDTSyncRequestDTO, user_id: str, user_role: RoleEnum
    ) -> tuple[str, str]:
        has_permission = permission_domain_service.can_read_note(
            sync_request_dto.note_id, user_id, user_role
        )
        if not has_permission:
            raise CollaborationNotAuthorized()

        client_state_vector = self._decode_base64(
            sync_request_dto.state_vector, "state vector"
        )

        crdt_service = get_crdt_service()
        with get_db_session() as session:
            note = session.get(Note, sync_request_dto.note_id)
            if not note:
                raise ValueError("Note not found")
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

        update_b64 = base64.b64encode(update_bytes).decode("utf-8")
        state_vector_b64 = base64.b64encode(server_state_vector).decode("utf-8")

        return state_vector_b64, update_b64

    def _cleanup_stale_sessions(self, note_id: str, user_id: str) -> list[str]:
        """
        DEPRECATED: Utiliser collaboration_session_service.cleanup_user_sessions() à la place.

        Cette méthode est conservée pour compatibilité mais délègue au service.
        """
        session_service = get_collaboration_session_service()
        return session_service.cleanup_user_sessions(note_id, user_id)

    def _build_session_dto(
        self, note_id: str, sessions: list[dict]
    ) -> CollaborationSessionDTO:
        collaborators = [
            CollaboratorDTO(
                user_id=session["user_id"],
                username=session["username"],
                socket_id=session["socket_id"],
                joined_at=datetime.now(timezone.utc),
            )
            for session in sessions
        ]

        return CollaborationSessionDTO(
            note_id=note_id,
            collaborators=collaborators,
            active_users_count=len(collaborators),
        )

    @staticmethod
    def _decode_base64(value: str, label: str) -> bytes:
        try:
            return base64.b64decode(value)
        except Exception:
            raise CollaborationInvalidOperation(f"Invalid base64-encoded {label}")


realtime_collaboration_domain_service = RealtimeCollaborationDomainService()

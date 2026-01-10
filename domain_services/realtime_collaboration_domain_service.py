from typing import List
from datetime import datetime, timezone
import base64

from daos.note_dao import Note
from daos.user_dao import User
from dtos.collaboration_dto import (
    CollaboratorDTO,
    CollaborationSessionDTO,
    CollaborationOperationDTO,
    CollaborationEventDTO,
    SendOperationDTO,
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
)
from exceptions.collaboration_exception import (
    CollaborationNotAuthorized,
    CollaborationInvalidOperation,
    CollaborationVersionConflict,
)
from domain_services.permission_domain_service import permission_domain_service
from repositorys import collaboration_repository
from utils.db import get_db_session
from utils.enums import RoleEnum
from utils.crdt_service import get_crdt_service
from utils.logger import get_logger

logger = get_logger(__name__)

DEFAULT_EMPTY_DOCUMENT = '{"type":"doc","content":[{"type":"paragraph"}]}'


class RealtimeCollaborationDomainService:
    def join_collaboration_session(
        self, note_id: str, user_id: str, user_role: RoleEnum, socket_id: str, initial_content: str | None = None
    ) -> tuple[CollaborationSessionDTO, CollaborationEventDTO]:
        with get_db_session() as session:
            note = session.get(Note, note_id)
            if not note:
                raise ValueError("Note not found")

            if not (note.content or "").strip():
                note.content = initial_content or DEFAULT_EMPTY_DOCUMENT

            has_permission = permission_domain_service.can_read_note(note_id, user_id, user_role)
            if not has_permission:
                raise CollaborationNotAuthorized()

            user = session.get(User, user_id)
            if not user:
                raise ValueError("User not found")
            username = user.username

        # Initialiser le document CRDT avec le contenu de la note
        crdt_service = get_crdt_service()
        crdt_service.get_or_create_document(note_id, note.content)

        self._cleanup_stale_sessions(note_id, user_id)

        collaboration_repository.create_session(note_id, user_id, socket_id, username)

        all_sessions = collaboration_repository.list_sessions_by_note(note_id)
        current_version = collaboration_repository.get_latest_version_for_note(note_id)

        session_dto = self._build_session_dto(note_id, all_sessions, note.content, current_version)

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
        session_data = collaboration_repository.find_session_by_socket(socket_id)

        if not session_data:
            return None

        collaboration_repository.delete_session_by_socket(socket_id)

        event = CollaborationEventDTO(
            event_type="user_left",
            user_id=user_id,
            username=session_data.get("username", "Unknown"),
            note_id=note_id,
        )

        return event

    def handle_disconnect(self, socket_id: str) -> CollaborationEventDTO | None:
        session_data = collaboration_repository.find_session_by_socket(socket_id)

        if not session_data:
            return None

        note_id = session_data.get("note_id")
        user_id = session_data.get("user_id")
        username = session_data.get("username")

        collaboration_repository.delete_session_by_socket(socket_id)

        event = CollaborationEventDTO(
            event_type="user_left",
            user_id=user_id,
            username=username,
            note_id=note_id,
        )

        return event

    def process_operation(
        self, operation_dto: SendOperationDTO, user_id: str, user_role: RoleEnum
    ) -> tuple[CollaborationEventDTO, int]:
        with get_db_session() as session_db:
            note = session_db.get(Note, operation_dto.note_id)
            if not note:
                raise ValueError("Note not found")

            # Check write permissions
            has_permission = permission_domain_service.can_write_note(
                operation_dto.note_id, user_id, user_role
            )
            if not has_permission:
                raise CollaborationNotAuthorized()

            current_version = collaboration_repository.get_latest_version_for_note(
                operation_dto.note_id
            )

            content_len = len(note.content) if note.content else 0

            # Validate version
            if operation_dto.operation.version != current_version + 1:
                raise CollaborationVersionConflict(current_version + 1, operation_dto.operation.version)

            # Validate operation
            self._validate_operation(operation_dto.operation, content_len, current_version)

            # Increment version
            new_version = collaboration_repository.increment_version_for_note(operation_dto.note_id)
            operation_dto.operation.version = new_version

            # Apply operation to content
            new_content = self._apply_operation(note.content, operation_dto.operation)
            note.content = new_content

        # Store operation in Redis
        collaboration_repository.store_operation_in_redis(
            note_id=operation_dto.note_id,
            user_id=user_id,
            operation_type=operation_dto.operation.operation_type,
            position=operation_dto.operation.position,
            content=operation_dto.operation.content,
            length=operation_dto.operation.length,
            version=operation_dto.operation.version,
        )

        # Create event
        event = CollaborationEventDTO(
            event_type="content_changed",
            user_id=user_id,
            username="",  # Will be filled by controller
            note_id=operation_dto.note_id,
            operation=operation_dto.operation,
        )

        return event, new_version

    def handle_cursor_position(
        self, note_id: str, user_id: str, position: int, username: str
    ) -> CollaborationEventDTO:
        collaboration_repository.set_cursor_position(note_id, user_id, position)

        event = CollaborationEventDTO(
            event_type="cursor_moved",
            user_id=user_id,
            username=username,
            note_id=note_id,
            cursor_position=position,
        )

        return event

    def handle_typing_status(
        self, note_id: str, user_id: str, is_typing: bool, username: str
    ) -> CollaborationEventDTO:
        collaboration_repository.set_typing_status(note_id, user_id, is_typing)

        event_type = "user_typing" if is_typing else "user_stopped_typing"

        event = CollaborationEventDTO(
            event_type=event_type,
            user_id=user_id,
            username=username,
            note_id=note_id,
        )

        return event

    def _cleanup_stale_sessions(self, note_id: str, user_id: str) -> List[str]:
        existing_sessions = collaboration_repository.list_sessions_by_note(note_id)
        stale_socket_ids = [
            session_item.get("socket_id")
            for session_item in existing_sessions
            if session_item.get("user_id") == user_id
        ]

        if stale_socket_ids:
            for stale_socket_id in stale_socket_ids:
                if stale_socket_id:
                    collaboration_repository.delete_session_by_socket(stale_socket_id)

        return stale_socket_ids

    def _build_session_dto(
        self, note_id: str, sessions: List[dict], content: str | None, version: int
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
            content=content,
            version=version,
        )

    def _validate_operation(
        self, operation: CollaborationOperationDTO, content_length: int, current_version: int
    ) -> None:
        if operation.version != current_version + 1:
            raise CollaborationVersionConflict(current_version + 1, operation.version)

        if operation.position < 0 or operation.position > content_length:
            raise CollaborationInvalidOperation(
                f"Position {operation.position} is out of range (0-{content_length})"
            )

        if operation.operation_type == "insert":
            if not operation.content:
                raise CollaborationInvalidOperation("Insert operation requires content")

        elif operation.operation_type == "delete":
            if operation.length is None or operation.length <= 0:
                raise CollaborationInvalidOperation("Delete operation requires a positive length")
            if operation.position + operation.length > content_length:
                raise CollaborationInvalidOperation("Delete range exceeds content length")

        elif operation.operation_type == "replace":
            if not operation.content:
                raise CollaborationInvalidOperation("Replace operation requires content")
            if operation.length is None or operation.length < 0:
                raise CollaborationInvalidOperation("Replace operation requires a non-negative length")

            # Full document replacement (position=0) is allowed
            if operation.position != 0:
                if operation.position + operation.length > content_length:
                    raise CollaborationInvalidOperation(
                        f"Replace range exceeds content length: position={operation.position}, "
                        f"length={operation.length}, content_length={content_length}"
                    )

    def _apply_operation(self, content: str, operation: CollaborationOperationDTO) -> str:
        if operation.operation_type == "insert":
            return (
                content[: operation.position] + operation.content + content[operation.position :]
            )

        elif operation.operation_type == "delete":
            end_pos = operation.position + (operation.length or 0)
            return content[: operation.position] + content[end_pos:]

        elif operation.operation_type == "replace":
            end_pos = operation.position + (operation.length or 0)
            return content[: operation.position] + operation.content + content[end_pos:]

        raise CollaborationInvalidOperation(f"Unknown operation type: {operation.operation_type}")

    def process_crdt_update(
        self, update_dto: CRDTUpdateDTO, user_id: str, user_role: RoleEnum
    ) -> CollaborationEventDTO:
        """
        Traite une mise à jour CRDT et la propage aux autres utilisateurs.

        Args:
            update_dto: DTO contenant la mise à jour CRDT
            user_id: Identifiant de l'utilisateur
            user_role: Rôle de l'utilisateur

        Returns:
            Événement de collaboration à diffuser

        Raises:
            CollaborationNotAuthorized: Si l'utilisateur n'a pas les permissions
        """
        # Vérifier les permissions d'écriture
        has_permission = permission_domain_service.can_write_note(
            update_dto.note_id, user_id, user_role
        )
        if not has_permission:
            raise CollaborationNotAuthorized()

        # Décoder la mise à jour depuis base64
        try:
            update_bytes = base64.b64decode(update_dto.update)
        except Exception as e:
            logger.error(f"Failed to decode CRDT update: {e}")
            raise CollaborationInvalidOperation("Invalid base64-encoded update")

        # Appliquer la mise à jour au document CRDT
        crdt_service = get_crdt_service()
        crdt_service.apply_update(update_dto.note_id, update_bytes)

        # Récupérer le nouveau contenu et le sauvegarder en DB
        new_content = crdt_service.get_content_as_text(update_dto.note_id)
        with get_db_session() as session:
            note = session.get(Note, update_dto.note_id)
            if note:
                note.content = new_content

        # Créer l'événement à diffuser
        event = CollaborationEventDTO(
            event_type="crdt_update",
            user_id=user_id,
            username="",  # Sera rempli par le controller
            note_id=update_dto.note_id,
            crdt_update=update_dto.update,
        )

        return event

    def handle_crdt_sync_request(
        self, sync_request_dto: CRDTSyncRequestDTO, user_id: str, user_role: RoleEnum
    ) -> tuple[str, str]:
        """
        Gère une demande de synchronisation CRDT.

        Args:
            sync_request_dto: DTO contenant la demande de synchronisation
            user_id: Identifiant de l'utilisateur
            user_role: Rôle de l'utilisateur

        Returns:
            Tuple (state_vector encodé, update encodé)

        Raises:
            CollaborationNotAuthorized: Si l'utilisateur n'a pas les permissions
        """
        # Vérifier les permissions de lecture
        has_permission = permission_domain_service.can_read_note(
            sync_request_dto.note_id, user_id, user_role
        )
        if not has_permission:
            raise CollaborationNotAuthorized()

        crdt_service = get_crdt_service()

        # Décoder le vecteur d'état du client
        try:
            client_state_vector = base64.b64decode(sync_request_dto.state_vector)
        except Exception as e:
            logger.error(f"Failed to decode state vector: {e}")
            raise CollaborationInvalidOperation("Invalid base64-encoded state vector")

        # Calculer les mises à jour nécessaires
        update_bytes = crdt_service.get_update_since_state(
            sync_request_dto.note_id, client_state_vector
        )

        # Obtenir le vecteur d'état actuel du serveur
        server_state_vector = crdt_service.get_state_vector(sync_request_dto.note_id)

        # Encoder en base64
        update_b64 = base64.b64encode(update_bytes).decode("utf-8")
        state_vector_b64 = base64.b64encode(server_state_vector).decode("utf-8")

        return state_vector_b64, update_b64


realtime_collaboration_domain_service = RealtimeCollaborationDomainService()

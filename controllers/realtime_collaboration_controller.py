from flask import request
from flask_socketio import emit, join_room, leave_room, disconnect
from domain_services.socketio_auth_domain_service import (
    get_current_user_context_from_socket,
    get_current_user_from_socket,
)
from domain_services.realtime_collaboration_domain_service import (
    realtime_collaboration_domain_service,
)
from dtos.collaboration_dto import (
    CRDTUpdateDTO,
    CRDTSyncRequestDTO,
)
from repositorys import collaboration_repository
from utils.socketio_service import get_socketio

def _get_username_from_socket(socket_id: str) -> str:
    session_data = collaboration_repository.find_session_by_socket(socket_id)
    return session_data.get("username") if session_data else "Unknown"

def register_socketio_handlers():
    socketio = get_socketio()

    @socketio.on("connect", namespace="/collaboration")
    def handle_connect(auth=None):
        user_id, _ = get_current_user_context_from_socket(auth)

        if not user_id:
            disconnect()
            return False

        return True

    @socketio.on("disconnect", namespace="/collaboration")
    def handle_disconnect():
        socket_id = request.sid
        event = realtime_collaboration_domain_service.handle_disconnect(socket_id)

        if event:
            emit(
                "collaboration_event",
                event.model_dump(mode="json"),
                room=f"note_{event.note_id}",
                skip_sid=socket_id,
                namespace="/collaboration",
            )

    @socketio.on("join_collaboration", namespace="/collaboration")
    def handle_join_collaboration(data):
        user_id, user_role = get_current_user_context_from_socket()
        note_id = data.get("note_id")
        initial_content = data.get("content")
        socket_id = request.sid

        session_dto, join_event = realtime_collaboration_domain_service.join_collaboration_session(
            note_id=note_id,
            user_id=user_id,
            user_role=user_role,
            socket_id=socket_id,
            initial_content=initial_content,
        )

        join_room(f"note_{note_id}")
        emit("collaboration_session", session_dto.model_dump(mode="json"), room=request.sid)

        emit(
            "collaboration_event",
            join_event.model_dump(mode="json"),
            room=f"note_{note_id}",
            skip_sid=socket_id,
            namespace="/collaboration",
        )

    @socketio.on("leave_collaboration", namespace="/collaboration")
    def handle_leave_collaboration(data):
        user_id = get_current_user_from_socket()

        note_id = data.get("note_id")
        socket_id = request.sid

        event = realtime_collaboration_domain_service.leave_collaboration_session(
            note_id=note_id, user_id=user_id, socket_id=socket_id
        )

        if event:
            leave_room(f"note_{note_id}")

            emit(
                "collaboration_event",
                event.model_dump(mode="json"),
                room=f"note_{note_id}",
                skip_sid=socket_id,
                namespace="/collaboration",
            )

    @socketio.on("crdt_update", namespace="/collaboration")
    def handle_crdt_update(data):
        """Handles CRDT update from a client."""
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id:
            return

        crdt_update_dto = CRDTUpdateDTO.model_validate(data)

        # Traiter la mise à jour CRDT
        event = realtime_collaboration_domain_service.process_crdt_update(
            update_dto=crdt_update_dto, user_id=user_id, user_role=user_role
        )

        socket_id = request.sid
        event.username = _get_username_from_socket(socket_id)

        # Diffuser la mise à jour à tous les autres clients
        emit(
            "collaboration_event",
            event.model_dump(mode="json"),
            room=f"note_{crdt_update_dto.note_id}",
            skip_sid=socket_id,
            namespace="/collaboration",
        )

    @socketio.on("crdt_sync_request", namespace="/collaboration")
    def handle_crdt_sync_request(data):
        """Handles CRDT synchronization request from a client."""
        user_id, user_role = get_current_user_context_from_socket()
        if not user_id:
            return

        sync_request_dto = CRDTSyncRequestDTO.model_validate(data)

        # Gérer la demande de synchronisation
        state_vector, update = realtime_collaboration_domain_service.handle_crdt_sync_request(
            sync_request_dto=sync_request_dto, user_id=user_id, user_role=user_role
        )

        # Répondre uniquement au client qui a fait la demande
        emit(
            "crdt_sync_reply",
            {
                "note_id": sync_request_dto.note_id,
                "state_vector": state_vector,
                "update": update,
            },
            room=request.sid,
        )

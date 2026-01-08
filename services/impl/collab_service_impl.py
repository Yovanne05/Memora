from werkzeug.exceptions import BadRequest, Forbidden

import config
from domain_services.permission_domain_service import permission_domain_service
from dtos.collab_dto import (
    CollabDocumentResponseDTO,
    CollabSessionResponseDTO,
    CollabSessionVerifyDTO,
    CollabSessionVerifyResponseDTO,
)
from exceptions.note_exception import NoteNotFound
from repositorys import note_repository
from utils.auth import get_current_user
from utils.collab_token import create_collab_token


class CollabService:
    def create_session(self, note_id: str) -> CollabSessionResponseDTO:
        note_entity = note_repository.find_one_unscoped(note_id)
        if not note_entity:
            raise NoteNotFound()

        user = get_current_user()
        permission = permission_domain_service.get_note_permission(
            note_id, user.id, user.role
        )

        scope: list[str] = []
        if permission.can_read():
            scope.append("read")
        if permission.can_write():
            scope.append("write")

        if not scope:
            raise Forbidden("Insufficient permissions for this document.")

        token = create_collab_token(
            note_id=note_id,
            user_id=user.id,
            scope=scope,
            expires_in_seconds=config.COLLAB_JWT_EXPIRES_SECONDS,
        )

        return CollabSessionResponseDTO(
            collab_token=token,
            scope=scope,
            expires_in=config.COLLAB_JWT_EXPIRES_SECONDS,
        )

    def verify_session(
        self,
        request: CollabSessionVerifyDTO,
        payload: dict,
    ) -> CollabSessionVerifyResponseDTO:
        if request.note_id != payload["note_id"]:
            raise Forbidden("Invalid document scope.")
        return CollabSessionVerifyResponseDTO(
            user_id=payload["user_id"],
            scope=payload["scope"],
        )

    def get_document(self, note_id: str) -> CollabDocumentResponseDTO:
        note_entity = note_repository.find_one_unscoped(note_id)
        if not note_entity:
            raise NoteNotFound()

        return CollabDocumentResponseDTO(
            note_id=note_id,
            yjs_snapshot=note_entity.yjs_snapshot,
            prose_mirror_json=note_entity.content,
        )

    def store_document(
        self,
        note_id: str,
        yjs_snapshot: str,
        prose_mirror_json: str | None,
    ) -> None:
        if not yjs_snapshot:
            raise BadRequest("Missing yjsSnapshot.")

        note_entity = note_repository.find_one_unscoped(note_id)
        if not note_entity:
            raise NoteNotFound()

        final_json = (
            prose_mirror_json
            if prose_mirror_json is not None
            else note_entity.content
        )
        note_repository.update_collab_data(
            note_id=note_id,
            yjs_snapshot=yjs_snapshot,
            prose_mirror_json=final_json,
        )


collab_service = CollabService()

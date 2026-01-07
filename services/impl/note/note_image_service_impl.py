import os
import mimetypes
from uuid import uuid4
from datetime import datetime, timezone
from werkzeug.datastructures import FileStorage

import config
from services.interfaces.note.note_image_service_interface import NoteImageServiceInterface
from repositorys import note_repository
from repositorys import note_image_repository
from daos.note_image_dao import NoteImage
from dtos.note_image_dto import NoteImageDTO
from mappers.note_image_mapper import note_image_to_dto
from exceptions.note_exception import NoteNotFound
from exceptions.note_image_exception import (
    FileTooLarge,
    InvalidFileType,
    NoFileProvided,
)
from utils.auth import get_current_user
from domain_services.permission_domain_service import permission_domain_service


class NoteImageService(NoteImageServiceInterface):
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    def __init__(self):
        self.upload_folder = getattr(config, "UPLOAD_FOLDER", "uploads")
        os.makedirs(self.upload_folder, exist_ok=True)

    def _allowed_extension(self, ext: str) -> bool:
        return ext.lower() in self.ALLOWED_EXTENSIONS

    def _get_file_size(self, file: FileStorage) -> int:
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        return size

    def _ensure_note_write_access(self, note_id: str):
        note = note_repository.find_one_unscoped(note_id)
        if not note:
            raise NoteNotFound()
        user = get_current_user()
        if not permission_domain_service.can_write_note(note_id, user.id, user.role):
            raise NoteNotFound()
        return note

    def upload_image(self, note_id: str, file: FileStorage) -> NoteImageDTO:
        self._ensure_note_write_access(note_id)

        if not file or not file.filename or file.filename.strip() == "":
            raise NoFileProvided()

        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if not self._allowed_extension(ext):
            raise InvalidFileType()

        file_size = self._get_file_size(file)
        if file_size > self.MAX_FILE_SIZE:
            raise FileTooLarge()

        filename = f"{uuid4()}.{ext}"
        note_folder = os.path.join(self.upload_folder, note_id)
        os.makedirs(note_folder, exist_ok=True)
        filepath = os.path.join(note_folder, filename)

        file.seek(0)
        file.save(filepath)

        mime_type = file.content_type or f"image/{ext}"
        if not mime_type:
            guessed_mime, _ = mimetypes.guess_type(file.filename)
            if guessed_mime:
                mime_type = guessed_mime

        image_entity = NoteImage(
            id=str(uuid4()),
            note_id=note_id,
            file_name=filename,
            file_path=filepath,
            file_size=file_size,
            mime_type=mime_type,
            uploaded_at=datetime.now(timezone.utc)
        )

        saved_entity = note_image_repository.add(image_entity)
        return note_image_to_dto(saved_entity)


note_image_service = NoteImageService()

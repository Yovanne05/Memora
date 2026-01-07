import os
from uuid import uuid4
from datetime import datetime, timezone
from typing import List
from werkzeug.datastructures import FileStorage

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
    NoteImageNotFound,
)
from utils.auth import get_current_user
from utils.access_scope import can_read_note_image


class NoteImageService(NoteImageServiceInterface):
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    def __init__(self):
        self.storage = get_storage_client()

    def _allowed_extension(self, ext: str) -> bool:
        return ext.lower() in self.ALLOWED_EXTENSIONS

    def _get_file_size(self, file: FileStorage) -> int:
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        return size

    def _build_storage_key(self, user_id: str, note_id: str, filename: str) -> str:
        return os.path.join("users", user_id, "notes", note_id, filename).replace("\\", "/")

    def _ensure_note_access(self, note_id: str):
        note = note_repository.find_one_unscoped(note_id)
        if not note:
            raise NoteNotFound()
        user = get_current_user()
        if not can_write_note(user, note):
            raise NoteNotFound()
        return note

    def _build_public_url(self, key: str) -> str:
        if self.storage.driver == "local":
            base = config.UPLOAD_PUBLIC_BASE_URL or "/uploads"
            base = base.rstrip("/")
            return f"{base}/{key}"
        return self.storage.get_public_url(key)

    def upload_image(self, note_id: str, file: FileStorage) -> NoteImageDTO:
        note = self._ensure_note_access(note_id)

        if not file or file.filename.strip() == "":
            raise NoFileProvided()

        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if not self._allowed_extension(ext):
            raise InvalidFileType()

        file_size = self._get_file_size(file)
        if file_size > self.MAX_FILE_SIZE:
            raise FileTooLarge()

        mime = sniff_mime(file)
        if not is_allowed_mime(mime, self.ALLOWED_MIME_TYPES):
            guessed_mime, _ = mimetypes.guess_type(file.filename)
            if guessed_mime and is_allowed_mime(guessed_mime, self.ALLOWED_MIME_TYPES):
                mime = guessed_mime
            else:
                raise InvalidFileType()

        filename = f"{uuid4()}.{ext}"

        note_folder = os.path.join(self.UPLOAD_FOLDER, note_id)
        os.makedirs(note_folder, exist_ok=True)

        filepath = os.path.join(note_folder, filename)

        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        file.save(filepath)

        image_entity = NoteImage(
            id=str(uuid4()),
            note_id=note_id,
            file_name=filename,
            file_path=filepath,
            file_size=file_size,
            mime_type=file.content_type or f"image/{ext}",
            uploaded_at=datetime.now(timezone.utc)
        )

        saved_entity = note_image_repository.add(image_entity)

        return note_image_to_dto(saved_entity)

    def list_images(self, note_id: str) -> List[NoteImageDTO]:
        user = get_current_user()
        if not can_read_note_image(user, note_id):
            raise NoteNotFound()

        images = note_image_repository.find_by_note(note_id)
        return [note_image_to_dto(img) for img in images]

    def delete_image(self, note_id: str, filename: str) -> None:
        note = note_repository.find_one_unscoped(note_id)
        if not note:
            raise NoteNotFound()

        image = note_image_repository.find_by_note_and_filename(note_id, filename)
        if not image:
            raise NoteImageNotFound()

        filepath = image.file_path
        if os.path.exists(filepath):
            os.remove(filepath)

        note_image_repository.delete(image.id)

        note_folder = os.path.join(self.UPLOAD_FOLDER, note_id)
        if os.path.exists(note_folder) and not os.listdir(note_folder):
            os.rmdir(note_folder)


note_image_service = NoteImageService()

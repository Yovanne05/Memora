import os
from uuid import uuid4
from werkzeug.datastructures import FileStorage

import config
from services.interfaces.note.note_image_service_interface import NoteImageServiceInterface
from repositorys import note_repository
from dtos.note_image_dto import NoteImageDTO
from exceptions.note_exception import NoteNotFound
from exceptions.note_image_exception import FileTooLarge, InvalidFileType, NoFileProvided
from utils.auth import get_current_user
from utils.access_scope import can_write_note
from utils.mime import sniff_mime, is_allowed_mime
from utils.storage import StorageError, get_storage_client


class NoteImageService(NoteImageServiceInterface):
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    MAX_FILE_SIZE = config.IMAGE_MAX_CONTENT_LENGTH

    def __init__(self):
        self.storage = get_storage_client()

    def _allowed_extension(self, ext: str) -> bool:
        return ext.lower() in self.ALLOWED_EXTENSIONS

    def _validate_file_size(self, file: FileStorage) -> bool:
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        return size <= self.MAX_FILE_SIZE

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

        if not self._validate_file_size(file):
            raise FileTooLarge()

        mime = sniff_mime(file)
        if not is_allowed_mime(mime, self.ALLOWED_MIME_TYPES):
            raise InvalidFileType()

        filename = f"{uuid4()}.{ext}"
        storage_key = self._build_storage_key(str(note.owner_id), note_id, filename)

        try:
            self.storage.save_file(file, storage_key, mime)
        except Exception as exc:
            raise StorageError(f"Unable to save file: {exc}") from exc

        file_url = self._build_public_url(storage_key)

        return NoteImageDTO(url=file_url)


note_image_service = NoteImageService()

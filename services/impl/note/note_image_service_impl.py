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
from domain_services.permission_domain_service import permission_domain_service
from utils.auth import get_current_user


class NoteImageService(NoteImageServiceInterface):
    UPLOAD_FOLDER = "uploads/notes"
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    def __init__(self):
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)

    def _allowed_file(self, filename: str) -> bool:
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in self.ALLOWED_EXTENSIONS
        )

    def _validate_file_size(self, file: FileStorage) -> bool:
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        return size <= self.MAX_FILE_SIZE

    def upload_image(self, note_id: str, file: FileStorage) -> NoteImageDTO:
        note = note_repository.find_one_unscoped(note_id)
        if not note:
            raise NoteNotFound()

        if not file or file.filename == "":
            raise NoFileProvided()

        if not self._allowed_file(file.filename):
            raise InvalidFileType()

        if not self._validate_file_size(file):
            raise FileTooLarge()

        ext = file.filename.rsplit(".", 1)[1].lower()
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
        if not permission_domain_service.can_read_note(note_id, user.id, user.role):
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

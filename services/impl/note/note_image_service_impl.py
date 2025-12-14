import os
from uuid import uuid4
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from repositorys import note_repository
from exceptions.note_exception import NoteNotFound


class NoteImageService:
    UPLOAD_FOLDER = "uploads/notes"
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

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

    def upload_image(self, note_id: str, file: FileStorage) -> str:
        note = note_repository.find_one(note_id)
        if not note:
            raise NoteNotFound()

        if not file or file.filename == "":
            raise ValueError("Aucun fichier fourni")

        if not self._allowed_file(file.filename):
            raise ValueError(
                f"Type de fichier non autorisé. Extensions autorisées : {', '.join(self.ALLOWED_EXTENSIONS)}"
            )

        if not self._validate_file_size(file):
            raise ValueError(
                f"Fichier trop volumineux. Taille maximale : {self.MAX_FILE_SIZE // (1024 * 1024)}MB"
            )

        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid4()}.{ext}"

        note_folder = os.path.join(self.UPLOAD_FOLDER, note_id)
        os.makedirs(note_folder, exist_ok=True)

        filepath = os.path.join(note_folder, filename)
        file.save(filepath)

        if not note.images:
            note.images = []
        note.images.append(filepath)
        note_repository.update(note)

        return filepath

    def delete_image(self, note_id: str, filename: str) -> None:
        note = note_repository.find_one(note_id)
        if not note:
            raise NoteNotFound()

        filepath = os.path.join(self.UPLOAD_FOLDER, note_id, filename)

        if filepath not in (note.images or []):
            raise ValueError("Image introuvable pour cette note")

        if os.path.exists(filepath):
            os.remove(filepath)

        note.images = [img for img in note.images if img != filepath]
        note_repository.update(note)

        note_folder = os.path.join(self.UPLOAD_FOLDER, note_id)
        if os.path.exists(note_folder) and not os.listdir(note_folder):
            os.rmdir(note_folder)


note_image_service = NoteImageService()

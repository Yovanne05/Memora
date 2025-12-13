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
        # Créer le dossier uploads si nécessaire
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)

    def _allowed_file(self, filename: str) -> bool:
        """Vérifie si l'extension du fichier est autorisée."""
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in self.ALLOWED_EXTENSIONS
        )

    def _validate_file_size(self, file: FileStorage) -> bool:
        """Vérifie que la taille du fichier ne dépasse pas la limite."""
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)  # Reset file pointer
        return size <= self.MAX_FILE_SIZE

    def upload_image(self, note_id: str, file: FileStorage) -> str:
        """
        Upload une image pour une note.

        Args:
            note_id: ID de la note
            file: Fichier à uploader

        Returns:
            Le chemin du fichier uploadé

        Raises:
            NoteNotFoundException: Si la note n'existe pas
            ValueError: Si le fichier n'est pas valide
        """
        # Vérifier que la note existe
        note = note_repository.find_one(note_id)
        if not note:
            raise NoteNotFound()

        # Valider le fichier
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

        # Générer un nom de fichier unique
        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid4()}.{ext}"

        # Créer le dossier de la note
        note_folder = os.path.join(self.UPLOAD_FOLDER, note_id)
        os.makedirs(note_folder, exist_ok=True)

        # Sauvegarder le fichier
        filepath = os.path.join(note_folder, filename)
        file.save(filepath)

        # Ajouter le chemin à la note
        if not note.images:
            note.images = []
        note.images.append(filepath)
        note_repository.update(note)

        return filepath

    def delete_image(self, note_id: str, filename: str) -> None:
        """
        Supprime une image d'une note.

        Args:
            note_id: ID de la note
            filename: Nom du fichier à supprimer

        Raises:
            NoteNotFoundException: Si la note n'existe pas
            ValueError: Si l'image n'existe pas
        """
        # Vérifier que la note existe
        note = note_repository.find_one(note_id)
        if not note:
            raise NoteNotFound()

        # Construire le chemin du fichier
        filepath = os.path.join(self.UPLOAD_FOLDER, note_id, filename)

        # Vérifier que l'image est bien dans la liste
        if filepath not in (note.images or []):
            raise ValueError("Image introuvable pour cette note")

        # Supprimer le fichier physique
        if os.path.exists(filepath):
            os.remove(filepath)

        # Retirer le chemin de la note
        note.images = [img for img in note.images if img != filepath]
        note_repository.update(note)

        # Supprimer le dossier s'il est vide
        note_folder = os.path.join(self.UPLOAD_FOLDER, note_id)
        if os.path.exists(note_folder) and not os.listdir(note_folder):
            os.rmdir(note_folder)


# Instance singleton
note_image_service = NoteImageService()

from abc import ABC, abstractmethod
from werkzeug.datastructures import FileStorage
from dtos.note_image_dto import NoteImageDTO


class NoteImageServiceInterface(ABC):
    @abstractmethod
    def upload_image(self, note_id: str, file: FileStorage) -> NoteImageDTO:
        """Protocol method - implemented by concrete service"""
        ...

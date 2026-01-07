from abc import ABC, abstractmethod
from typing import List
from werkzeug.datastructures import FileStorage
from dtos.note_image_dto import NoteImageDTO


class NoteImageServiceInterface(ABC):
    @abstractmethod
    def upload_image(self, note_id: str, file: FileStorage) -> NoteImageDTO:
        ...

    @abstractmethod
    def list_images(self, note_id: str) -> List[NoteImageDTO]:
        """Protocol method - implemented by concrete service"""
        ...

    @abstractmethod
    def delete_image(self, note_id: str, filename: str) -> None:
        """Protocol method - implemented by concrete service"""
        ...

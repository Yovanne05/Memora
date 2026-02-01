from abc import ABC, abstractmethod

from dtos.collection_dto import CollectionDTO
from dtos.note_dto import NoteDTO


class SharedServiceInterface(ABC):
    @abstractmethod
    def get_note_by_token(self, token: str) -> NoteDTO:
        """
        Retrieve a note by its public share link token.

        Args:
            token: The public share link token

        Returns:
            NoteDTO: The note data

        Raises:
            SharedResourceNotFound: If the token is invalid or the note doesn't exist
        """
        pass

    @abstractmethod
    def get_collection_by_token(self, token: str) -> CollectionDTO:
        """
        Retrieve a collection by its public share link token.

        Args:
            token: The public share link token

        Returns:
            CollectionDTO: The collection data

        Raises:
            SharedResourceNotFound: If the token is invalid or the collection doesn't exist
        """
        pass

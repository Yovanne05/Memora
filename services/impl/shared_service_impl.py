from dtos.note_dto import NoteDTO
from dtos.collection_dto import CollectionDTO
from exceptions.shared_exception import SharedResourceNotFound
from mappers.note_mapper import note_to_dto
from mappers.collection_mapper import collection_to_dto
from repositorys import note_share_link_repository, collection_share_link_repository, note_repository, collection_repository


class SharedService:
    def get_note_by_token(self, token: str) -> NoteDTO:
        share_link = note_share_link_repository.find_one(token)
        if not share_link:
            raise SharedResourceNotFound()

        note = note_repository.find_one_unscoped(share_link.note_id)
        if not note:
            raise SharedResourceNotFound()

        return note_to_dto(note)

    def get_collection_by_token(self, token: str) -> CollectionDTO:
        share_link = collection_share_link_repository.find_one(token)
        if not share_link:
            raise SharedResourceNotFound()

        collection = collection_repository.find_one_unscoped(share_link.collection_id)
        if not collection:
            raise SharedResourceNotFound()

        return collection_to_dto(collection)


shared_service = SharedService()

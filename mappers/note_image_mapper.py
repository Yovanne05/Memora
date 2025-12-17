from daos.note_image_dao import NoteImage
from dtos.note_image_dto import NoteImageDTO


def note_image_to_dto(note_image: NoteImage) -> NoteImageDTO:
    return NoteImageDTO(
        id=note_image.id,
        note_id=note_image.note_id,
        file_name=note_image.file_name,
        file_path=note_image.file_path,
        file_size=note_image.file_size,
        mime_type=note_image.mime_type,
        uploaded_at=note_image.uploaded_at,
    )

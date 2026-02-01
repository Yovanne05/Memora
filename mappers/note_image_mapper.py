from daos.note_image_dao import NoteImage
from dtos.note_image_dto import NoteImageDTO


def note_image_to_dto(image: NoteImage) -> NoteImageDTO:
    """Convert a NoteImage entity to a DTO."""
    url = f"/notes/{image.note_id}/attachments/{image.file_name}"

    return NoteImageDTO(url=url)

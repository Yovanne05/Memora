from daos.note_image_dao import NoteImage
from dtos.note_image_dto import NoteImageDTO


def note_image_to_dto(image: NoteImage) -> NoteImageDTO:
    """Convertit une entité NoteImage en DTO"""
    # Construction de l'URL publique à partir du file_path
    # L'URL sera construite par le service avec _build_public_url
    url = f"/uploads/{image.note_id}/{image.file_name}"

    return NoteImageDTO(url=url)

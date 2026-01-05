from pydantic import BaseModel


class NoteImageDTO(BaseModel):
    note_id: str
    url: str

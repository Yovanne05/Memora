from pydantic import BaseModel


class NoteImageDTO(BaseModel):
    url: str

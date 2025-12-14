from pydantic import BaseModel
from datetime import datetime


class NoteImageDTO(BaseModel):
    id: str
    note_id: str
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_at: datetime

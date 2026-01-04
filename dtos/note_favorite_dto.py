from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NoteFavoriteDTO(BaseModel):
    user_id: str
    note_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

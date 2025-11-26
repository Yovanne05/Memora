from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TagCreateDTO(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class TagUpdateDTO(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)


class TagDTO(BaseModel):
    id: str
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

from dtos.note_dto import NoteDTO
from utils.enums import VisibilityEnum
from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field




class CollectionCreateDTO(BaseModel) :
    name : str = Field(min_length = 1, max_length = 50)
    description : str | None = None
    owner_id : str = Field(min_length = 1, max_length = 36)
    visibility : VisibilityEnum = VisibilityEnum.PRIVATE
    tags : List[str] = Field(default_factory = list)


class CollectionUpdateDTO(BaseModel) :
    name : str | None = Field(default = None, min_length = 1, max_length = 50)
    description : str | None = None
    visibility : VisibilityEnum | None = None
    tags : List[str] | None = None


class CollectionDTO(BaseModel) :
    id : str
    name : str
    description : str | None = None
    visibility : VisibilityEnum
    owner_id : str
    tags : List[str] = Field(default_factory = list)
    created_at : datetime
    updated_at : datetime
    notes : List[NoteDTO] = Field(default_factory = list)
    edges : List = Field(default_factory = list)
    nodes : List = Field(default_factory = list)
    model_config = ConfigDict(from_attributes = True)

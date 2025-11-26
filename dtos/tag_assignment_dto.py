from pydantic import BaseModel, Field


class TagAssignmentDTO(BaseModel):
    tag_ids: list[str] = Field(default_factory=list, alias="tagIds", min_length=0)

from pydantic import BaseModel, ConfigDict


class OwnerDTO(BaseModel):
    user_id: str
    username: str

    model_config = ConfigDict(from_attributes=True)

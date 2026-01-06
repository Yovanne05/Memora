from pydantic import BaseModel, ConfigDict


class OwnerDTO(BaseModel):
    """Représente un propriétaire (owner) d'une note ou collection"""
    user_id: str
    username: str

    model_config = ConfigDict(from_attributes=True)

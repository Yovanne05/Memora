from pydantic import BaseModel, ConfigDict
from utils.enums import SharePermissionEnum


class UserAccessDTO(BaseModel) :
    user_id : str
    permission : SharePermissionEnum

    model_config = ConfigDict(from_attributes = True)

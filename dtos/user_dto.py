from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from utils.enums import RoleEnum


class UserCreateDTO(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    username: str | None = Field(default=None, min_length=3, max_length=50)
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    role: RoleEnum = RoleEnum.CLIENT


class UserUpdateDTO(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=255)
    username: str | None = Field(default=None, min_length=3, max_length=50)
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    role: RoleEnum | None = None


class UserDTO(BaseModel):
    id: str
    email: EmailStr
    username: str | None = None
    display_name: str | None = None
    created_at: datetime
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from utils.enums import RoleEnum
from utils.security import is_password_strong

PASSWORD_RULE_MESSAGE = (
    "Password must be at least 8 characters and include one uppercase letter, "
    "one digit, and one special character."
)


class UserCreateDTO(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    username: str | None = Field(default=None, min_length=3, max_length=50)
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    role: RoleEnum = RoleEnum.CLIENT

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not is_password_strong(value):
            raise ValueError(PASSWORD_RULE_MESSAGE)
        return value


class UserUpdateDTO(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=255)
    username: str | None = Field(default=None, min_length=3, max_length=50)
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    role: RoleEnum | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not is_password_strong(value):
            raise ValueError(PASSWORD_RULE_MESSAGE)
        return value


class UserDTO(BaseModel):
    id: str
    email: EmailStr
    username: str | None = None
    display_name: str | None = None
    created_at: datetime
    last_login: datetime | None = None
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)

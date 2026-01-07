from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from dtos.user_dto import UserDTO
from utils.security import is_password_strong, PASSWORD_VALIDATION_ERROR


class RegisterDTO(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=255)
    username: str | None = Field(default=None, min_length=3, max_length=50)
    display_name: str | None = Field(default=None, min_length=1, max_length=100)

    model_config = ConfigDict(extra="forbid")

    @field_validator("password") # NOSONAR
    def validate_password(cls, value: str) -> str:
        if not is_password_strong(value):
            raise ValueError(PASSWORD_VALIDATION_ERROR)
        return value


class LoginDTO(BaseModel):
    identifier: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=12, max_length=255)

    model_config = ConfigDict(extra="forbid")


class AuthResponseDTO(BaseModel):
    user: UserDTO
    access_token: str


class AuthMeResponseDTO(BaseModel):
    user: UserDTO

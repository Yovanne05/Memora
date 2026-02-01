import re
import bcrypt

PASSWORD_MIN_LENGTH = 12
PASSWORD_REGEX = re.compile(
    rf"^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{{{PASSWORD_MIN_LENGTH},}}$"
)
PASSWORD_VALIDATION_ERROR = (
    f"Password must be at least {PASSWORD_MIN_LENGTH} characters and include one "
    "uppercase letter, one digit, and one special character."
)


def is_password_strong(raw_password: str) -> bool:
    return bool(PASSWORD_REGEX.match(raw_password))


def verify_password(raw_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            raw_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False

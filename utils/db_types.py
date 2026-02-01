import json
from typing import Any

from sqlalchemy import String, Text, TypeDecorator
from sqlalchemy.dialects.postgresql import ARRAY


class StringArray(TypeDecorator):
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(ARRAY(String))
        else:
            return dialect.type_descriptor(Text())

    def process_bind_param(self, value: list[str] | None, dialect) -> Any:
        """Convert Python list to database format."""
        if value is None:
            return None

        if dialect.name == "postgresql":
            return value
        else:
            # SQLite
            return json.dumps(value)

    def process_result_value(self, value: Any, dialect) -> list[str] | None:
        if value is None:
            return []

        if dialect.name == "postgresql":
            # PostgreSQL
            return value if value else []
        else:
            # SQLite
            if isinstance(value, str):
                return json.loads(value) if value else []
            return value if value else []

import json
from typing import Any, List
import redis
from utils.logger import get_logger

logger = get_logger(__name__)

_redis_client = None


def init_redis(host: str = "localhost", port: int = 6379, db: int = 0) -> redis.Redis:
    """Initializes the Redis client."""
    global _redis_client
    try:
        _redis_client = redis.Redis(
            host=host,
            port=port,
            db=db,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        _redis_client.ping()
        logger.info(f"Redis connected successfully to {host}:{port}")
        return _redis_client
    except redis.ConnectionError as e:
        logger.error(f"Failed to connect to Redis: {e}")
        raise


def get_redis_client() -> redis.Redis:
    """Gets the Redis client instance."""
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return _redis_client


class CollaborationRedisStore:
    """Redis store for collaboration data."""

    def __init__(self):
        self.client = get_redis_client()
        self.session_ttl = 86400  # 24 hours
        self.operation_ttl = 3600  # 1 hour

    # ========== Session Management ==========

    def create_session(self, note_id: str, user_id: str, socket_id: str, username: str) -> None:
        """Creates a collaboration session in Redis."""
        session_key = f"collab:session:{socket_id}"
        session_data = {
            "note_id": note_id,
            "user_id": user_id,
            "socket_id": socket_id,
            "username": username,
        }
        self.client.hset(session_key, mapping=session_data)
        self.client.expire(session_key, self.session_ttl)

        # Add to note's active sessions set
        note_sessions_key = f"collab:note:{note_id}:sessions"
        self.client.sadd(note_sessions_key, socket_id)
        self.client.expire(note_sessions_key, self.session_ttl)

        # Add to user's active sessions set
        user_sessions_key = f"collab:user:{user_id}:sessions"
        self.client.sadd(user_sessions_key, socket_id)
        self.client.expire(user_sessions_key, self.session_ttl)

    def get_session_by_socket(self, socket_id: str) -> dict | None:
        """Gets a session by socket ID."""
        session_key = f"collab:session:{socket_id}"
        data = self.client.hgetall(session_key)
        return data if data else None

    def delete_session(self, socket_id: str) -> None:
        """Deletes a session from Redis."""
        session_data = self.get_session_by_socket(socket_id)
        if not session_data:
            return

        note_id = session_data.get("note_id")
        user_id = session_data.get("user_id")

        # Remove from all sets
        if note_id:
            note_sessions_key = f"collab:note:{note_id}:sessions"
            self.client.srem(note_sessions_key, socket_id)

        if user_id:
            user_sessions_key = f"collab:user:{user_id}:sessions"
            self.client.srem(user_sessions_key, socket_id)

        # Delete the session hash
        session_key = f"collab:session:{socket_id}"
        self.client.delete(session_key)

    def list_sessions_by_note(self, note_id: str) -> List[dict]:
        """Lists all active sessions for a note."""
        note_sessions_key = f"collab:note:{note_id}:sessions"
        socket_ids = self.client.smembers(note_sessions_key)

        sessions = []
        for socket_id in socket_ids:
            session = self.get_session_by_socket(socket_id)
            if session:
                sessions.append(session)
            else:
                # Clean up stale reference
                self.client.srem(note_sessions_key, socket_id)

        return sessions

    def user_has_session_on_note(self, user_id: str, note_id: str) -> bool:
        """Checks if a user already has an active session on a note."""
        sessions = self.list_sessions_by_note(note_id)
        return any(s.get("user_id") == user_id for s in sessions)

    # ========== Operation Management ==========

    def increment_version(self, note_id: str) -> int:
        """Increments and returns the version for a note."""
        version_key = f"collab:note:{note_id}:version"
        return self.client.incr(version_key)

    def get_version(self, note_id: str) -> int:
        """Gets the current version for a note."""
        version_key = f"collab:note:{note_id}:version"
        version = self.client.get(version_key)
        return int(version) if version else 0

    def store_operation(
        self,
        note_id: str,
        user_id: str,
        operation_type: str,
        position: int,
        content: str,
        length: int | None,
        version: int,
    ) -> None:
        """Stores an operation in Redis (for recent history)."""
        operation_key = f"collab:note:{note_id}:operations"
        operation_data = {
            "user_id": user_id,
            "operation_type": operation_type,
            "position": position,
            "content": content,
            "length": length,
            "version": version,
        }

        # Store in a list (limited to last 100 operations)
        self.client.lpush(operation_key, json.dumps(operation_data))
        self.client.ltrim(operation_key, 0, 99)  # Keep only last 100 operations
        self.client.expire(operation_key, self.operation_ttl)

    def get_operations_since_version(self, note_id: str, since_version: int) -> List[dict]:
        """Gets operations since a specific version."""
        operation_key = f"collab:note:{note_id}:operations"
        operations_json = self.client.lrange(operation_key, 0, -1)

        operations = []
        for op_json in reversed(operations_json):  # Reverse to get chronological order
            op = json.loads(op_json)
            if op["version"] > since_version:
                operations.append(op)

        return sorted(operations, key=lambda x: x["version"])

    # ========== Cursor & Typing Status ==========

    def set_cursor_position(self, note_id: str, user_id: str, position: int) -> None:
        """Sets a user's cursor position for a note."""
        cursor_key = f"collab:note:{note_id}:cursors"
        self.client.hset(cursor_key, user_id, position)
        self.client.expire(cursor_key, 300)  # 5 minutes

    def get_cursor_positions(self, note_id: str) -> dict:
        """Gets all cursor positions for a note."""
        cursor_key = f"collab:note:{note_id}:cursors"
        return {k: int(v) for k, v in self.client.hgetall(cursor_key).items()}

    def set_typing_status(self, note_id: str, user_id: str, is_typing: bool) -> None:
        """Sets a user's typing status for a note."""
        typing_key = f"collab:note:{note_id}:typing"
        if is_typing:
            self.client.sadd(typing_key, user_id)
            self.client.expire(typing_key, 10)  # 10 seconds
        else:
            self.client.srem(typing_key, user_id)

    def get_typing_users(self, note_id: str) -> set:
        """Gets all users currently typing on a note."""
        typing_key = f"collab:note:{note_id}:typing"
        return self.client.smembers(typing_key)

    # ========== Cleanup ==========

    def cleanup_note_data(self, note_id: str) -> None:
        """Cleans up all collaboration data for a note."""
        patterns = [
            f"collab:note:{note_id}:sessions",
            f"collab:note:{note_id}:version",
            f"collab:note:{note_id}:operations",
            f"collab:note:{note_id}:cursors",
            f"collab:note:{note_id}:typing",
        ]
        for pattern in patterns:
            self.client.delete(pattern)


# Singleton instance
_collab_store = None


def get_collaboration_store() -> CollaborationRedisStore:
    """Gets the collaboration store instance."""
    global _collab_store
    if _collab_store is None:
        _collab_store = CollaborationRedisStore()
    return _collab_store

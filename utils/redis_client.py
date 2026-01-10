import redis
import config
from redis.retry import Retry
from redis.backoff import ExponentialBackoff
from redis.exceptions import ConnectionError, TimeoutError, RedisError
from utils.logger import get_logger

logger = get_logger(__name__)
_redis_client = None


def init_redis(host: str = "localhost", port: int = 6379, db: int = 0) -> redis.Redis:
    """Initialize and verify the Redis client."""
    global _redis_client

    retry = Retry(
        backoff=ExponentialBackoff(base=0.05, cap=2.0),
        retries=3,
    )

    _redis_client = redis.Redis(
        host=host,
        port=port,
        db=db,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        socket_keepalive=True,
        socket_keepalive_options={},
        retry=retry,
        retry_on_error=[ConnectionError, TimeoutError],
        health_check_interval=30,
    )

    _redis_client.ping()
    return _redis_client


def get_redis_client() -> redis.Redis:
    """Return the initialized Redis client or raise if missing."""
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return _redis_client


class CollaborationRedisStore:
    """Redis-backed store for collaboration sessions."""

    def __init__(self):
        self.client = get_redis_client()
        self.session_ttl = config.COLLAB_SESSION_TTL_SECONDS

    def _safe_execute(self, operation, default=None):
        """Execute a Redis operation with error handling."""
        try:
            return operation()
        except (ConnectionError, TimeoutError) as e:
            logger.warning(f"Redis operation failed (transient): {e}")
            return default
        except RedisError as e:
            logger.error(f"Redis operation failed: {e}")
            return default
        except Exception as e:
            logger.error(f"Unexpected error in Redis operation: {e}")
            return default

    def create_session(self, note_id: str, user_id: str, socket_id: str, username: str) -> None:
        """Create a collaboration session and index it by note/user."""
        def operation():
            session_key = f"collab:session:{socket_id}"
            session_data = {
                "note_id": note_id,
                "user_id": user_id,
                "socket_id": socket_id,
                "username": username,
            }
            pipe = self.client.pipeline()
            pipe.hset(session_key, mapping=session_data)
            pipe.expire(session_key, self.session_ttl)

            note_sessions_key = f"collab:note:{note_id}:sessions"
            pipe.sadd(note_sessions_key, socket_id)
            pipe.expire(note_sessions_key, self.session_ttl)

            user_sessions_key = f"collab:user:{user_id}:sessions"
            pipe.sadd(user_sessions_key, socket_id)
            pipe.expire(user_sessions_key, self.session_ttl)

            pipe.execute()

        self._safe_execute(operation)

    def get_session_by_socket(self, socket_id: str) -> dict | None:
        """Fetch a session by socket id."""
        def operation():
            session_key = f"collab:session:{socket_id}"
            data = self.client.hgetall(session_key)
            return data if data else None

        return self._safe_execute(operation, default=None)

    def delete_session(self, socket_id: str) -> None:
        """Remove a collaboration session and its indexes."""
        session_data = self.get_session_by_socket(socket_id)
        if not session_data:
            return

        def operation():
            note_id = session_data.get("note_id")
            user_id = session_data.get("user_id")

            pipe = self.client.pipeline()

            if note_id:
                note_sessions_key = f"collab:note:{note_id}:sessions"
                pipe.srem(note_sessions_key, socket_id)

            if user_id:
                user_sessions_key = f"collab:user:{user_id}:sessions"
                pipe.srem(user_sessions_key, socket_id)

            session_key = f"collab:session:{socket_id}"
            pipe.delete(session_key)

            pipe.execute()

        self._safe_execute(operation)

    def list_sessions_by_note(self, note_id: str) -> list[dict]:
        """List active sessions for a note."""
        def operation():
            note_sessions_key = f"collab:note:{note_id}:sessions"
            socket_ids = self.client.smembers(note_sessions_key)

            sessions = []
            for socket_id in socket_ids:
                session = self.get_session_by_socket(socket_id)
                if session:
                    sessions.append(session)
                else:
                    self.client.srem(note_sessions_key, socket_id)

            return sessions

        return self._safe_execute(operation, default=[])


_collab_store = None


def get_collaboration_store() -> CollaborationRedisStore:
    """Return the singleton collaboration store."""
    global _collab_store
    if _collab_store is None:
        _collab_store = CollaborationRedisStore()
    return _collab_store

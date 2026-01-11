import config
from redis.exceptions import ConnectionError, TimeoutError, RedisError

from services.impl.infrastructure.redis_client_service_impl import (
    redis_client_service,
)
from services.interfaces.infrastructure.collaboration_session_store_interface import (
    CollaborationSessionStoreInterface,
)
from utils.logger import get_logger

logger = get_logger(__name__)


class CollaborationSessionStore(CollaborationSessionStoreInterface):
    def __init__(self):
        self._client = None
        self.session_ttl = config.COLLAB_SESSION_TTL_SECONDS

    @property
    def client(self):
        return self._get_client()

    def _get_client(self):
        if self._client is None:
            self._client = redis_client_service.get_redis_client()
        return self._client

    def _safe_execute(self, operation, default=None):
        try:
            return operation()
        except (ConnectionError, TimeoutError) as exc:
            logger.warning(f"Redis operation failed (transient): {exc}")
            return default
        except RedisError as exc:
            logger.error(f"Redis operation failed: {exc}")
            return default
        except Exception as exc:
            logger.error(f"Unexpected error in Redis operation: {exc}")
            return default

    def create_session(
        self, note_id: str, user_id: str, socket_id: str, username: str
    ) -> None:
        def operation():
            client = self._get_client()
            session_key = f"collab:session:{socket_id}"
            session_data = {
                "note_id": note_id,
                "user_id": user_id,
                "socket_id": socket_id,
                "username": username,
            }
            pipe = client.pipeline()
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
        def operation():
            client = self._get_client()
            session_key = f"collab:session:{socket_id}"
            data = client.hgetall(session_key)
            return data if data else None

        return self._safe_execute(operation, default=None)

    def delete_session(self, socket_id: str) -> None:
        session_data = self.get_session_by_socket(socket_id)
        if not session_data:
            return

        def operation():
            client = self._get_client()
            note_id = session_data.get("note_id")
            user_id = session_data.get("user_id")

            pipe = client.pipeline()

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
        def operation():
            client = self._get_client()
            note_sessions_key = f"collab:note:{note_id}:sessions"
            socket_ids = client.smembers(note_sessions_key)

            sessions = []
            for socket_id in socket_ids:
                session = self.get_session_by_socket(socket_id)
                if session:
                    sessions.append(session)
                else:
                    client.srem(note_sessions_key, socket_id)

            return sessions

        return self._safe_execute(operation, default=[])


collaboration_session_store = CollaborationSessionStore()

import redis

_redis_client = None


def init_redis(host: str = "localhost", port: int = 6379, db: int = 0) -> redis.Redis:
    global _redis_client
    _redis_client = redis.Redis(
        host=host,
        port=port,
        db=db,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
    )
    _redis_client.ping()
    return _redis_client


def get_redis_client() -> redis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return _redis_client


class CollaborationRedisStore:
    def __init__(self):
        self.client = get_redis_client()
        self.session_ttl = 86400  # 24 hours

    def create_session(self, note_id: str, user_id: str, socket_id: str, username: str) -> None:
        session_key = f"collab:session:{socket_id}"
        session_data = {
            "note_id": note_id,
            "user_id": user_id,
            "socket_id": socket_id,
            "username": username,
        }
        self.client.hset(session_key, mapping=session_data)
        self.client.expire(session_key, self.session_ttl)

        note_sessions_key = f"collab:note:{note_id}:sessions"
        self.client.sadd(note_sessions_key, socket_id)
        self.client.expire(note_sessions_key, self.session_ttl)

        user_sessions_key = f"collab:user:{user_id}:sessions"
        self.client.sadd(user_sessions_key, socket_id)
        self.client.expire(user_sessions_key, self.session_ttl)

    def get_session_by_socket(self, socket_id: str) -> dict | None:
        session_key = f"collab:session:{socket_id}"
        data = self.client.hgetall(session_key)
        return data if data else None

    def delete_session(self, socket_id: str) -> None:
        session_data = self.get_session_by_socket(socket_id)
        if not session_data:
            return

        note_id = session_data.get("note_id")
        user_id = session_data.get("user_id")

        if note_id:
            note_sessions_key = f"collab:note:{note_id}:sessions"
            self.client.srem(note_sessions_key, socket_id)

        if user_id:
            user_sessions_key = f"collab:user:{user_id}:sessions"
            self.client.srem(user_sessions_key, socket_id)

        session_key = f"collab:session:{socket_id}"
        self.client.delete(session_key)

    def list_sessions_by_note(self, note_id: str) -> list[dict]:
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


_collab_store = None


def get_collaboration_store() -> CollaborationRedisStore:
    global _collab_store
    if _collab_store is None:
        _collab_store = CollaborationRedisStore()
    return _collab_store
import redis
from redis.retry import Retry
from redis.backoff import ExponentialBackoff
from redis.exceptions import ConnectionError, TimeoutError

from services.interfaces.infrastructure.redis_client_service_interface import (
    RedisClientServiceInterface,
)


class RedisClientService(RedisClientServiceInterface):
    def __init__(self):
        self._redis_client: redis.Redis | None = None

    def init_redis(
        self, host: str = "localhost", port: int = 6379, db: int = 0
    ) -> redis.Redis:
        retry = Retry(
            backoff=ExponentialBackoff(base=0.05, cap=2.0),
            retries=3,
        )

        self._redis_client = redis.Redis(
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

        self._redis_client.ping()
        return self._redis_client

    def get_redis_client(self) -> redis.Redis:
        if self._redis_client is None:
            raise RuntimeError("Redis client not initialized. Call init_redis() first.")
        return self._redis_client


redis_client_service = RedisClientService()

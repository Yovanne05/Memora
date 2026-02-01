from typing import Protocol

import redis


class RedisClientServiceInterface(Protocol):
    def init_redis(
        self, host: str = "localhost", port: int = 6379, db: int = 0
    ) -> redis.Redis:
        ...

    def get_redis_client(self) -> redis.Redis:
        ...

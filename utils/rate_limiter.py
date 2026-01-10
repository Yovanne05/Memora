import functools
import time
from typing import Callable
from flask import request
from flask_socketio import disconnect
from services.impl.infrastructure.redis_client_service_impl import redis_client_service

class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded."""
    pass


class RedisRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.client = redis_client_service.get_redis_client()

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds

        rate_limit_key = f"ratelimit:{key}"

        self.client.zremrangebyscore(rate_limit_key, 0, window_start)

        current_count = self.client.zcard(rate_limit_key)

        if current_count >= self.max_requests:
            return False

        self.client.zadd(rate_limit_key, {str(now): now})
        self.client.expire(rate_limit_key, self.window_seconds * 2)

        return True

    def get_remaining_requests(self, key: str) -> int:
        now = time.time()
        window_start = now - self.window_seconds
        rate_limit_key = f"ratelimit:{key}"
        self.client.zremrangebyscore(rate_limit_key, 0, window_start)
        current_count = self.client.zcard(rate_limit_key)

        return max(0, self.max_requests - current_count)


def socketio_rate_limit(max_requests: int, window_seconds: int, disconnect_on_exceed: bool = True):
    limiter = RedisRateLimiter(max_requests, window_seconds)
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            from services.impl.realtime.socketio_auth_service_impl import (
                socketio_auth_service,
            )

            try:
                user_id = socketio_auth_service.get_current_user_from_socket()
                rate_limit_key = f"user:{user_id}" if user_id else f"socket:{request.sid}"
            except Exception:
                rate_limit_key = f"socket:{request.sid}"

            if not limiter.is_allowed(rate_limit_key):
                if disconnect_on_exceed:
                    disconnect()
                raise RateLimitExceeded(
                    f"Rate limit exceeded: {max_requests} requests per {window_seconds}s"
                )
            return func(*args, **kwargs)

        return wrapper
    return decorator


def get_rate_limit_info(user_id: str, max_requests: int, window_seconds: int) -> dict:
    limiter = RedisRateLimiter(max_requests, window_seconds)
    rate_limit_key = f"user:{user_id}"
    remaining = limiter.get_remaining_requests(rate_limit_key)
    now = time.time()
    reset_time = now + window_seconds

    return {
        "limit": max_requests,
        "remaining": remaining,
        "reset_at": int(reset_time),
        "window_seconds": window_seconds,
    }

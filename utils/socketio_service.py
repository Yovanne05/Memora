from flask import Flask
from flask_socketio import SocketIO

_socketio: SocketIO | None = None


def init_socketio(app: Flask, cors_allowed_origins: str = "*", async_mode: str = "threading") -> SocketIO:
    global _socketio
    _socketio = SocketIO()
    _socketio.init_app(app, cors_allowed_origins=cors_allowed_origins, async_mode=async_mode)
    return _socketio


def get_socketio() -> SocketIO:
    if _socketio is None:
        raise RuntimeError("SocketIO not initialized. Call init_socketio() first.")
    return _socketio


def run_socketio(app: Flask, **kwargs) -> None:
    socketio = get_socketio()
    socketio.run(app, **kwargs)

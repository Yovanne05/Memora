from flask import Flask
from flask_socketio import SocketIO

from services.interfaces.realtime.socketio_service_interface import (
    SocketIOServiceInterface,
)


class SocketIOService(SocketIOServiceInterface):
    def __init__(self):
        self._socketio: SocketIO | None = None

    def init_socketio(
        self,
        app: Flask,
        cors_allowed_origins: list[str] | str = "*",
        async_mode: str = "threading",
        path: str | None = None,
    ) -> SocketIO:
        self._socketio = SocketIO()
        self._socketio.init_app(
            app,
            cors_allowed_origins=cors_allowed_origins,
            async_mode=async_mode,
            path=path,
        )
        return self._socketio

    def get_socketio(self) -> SocketIO:
        if self._socketio is None:
            raise RuntimeError("SocketIO not initialized. Call init_socketio() first.")
        return self._socketio

    def run_socketio(self, app: Flask, **kwargs) -> None:
        socketio = self.get_socketio()
        socketio.run(app, **kwargs)


socketio_service = SocketIOService()

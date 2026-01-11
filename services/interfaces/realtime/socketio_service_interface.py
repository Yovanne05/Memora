from typing import Protocol

from flask import Flask
from flask_socketio import SocketIO


class SocketIOServiceInterface(Protocol):
    def init_socketio(
        self,
        app: Flask,
        cors_allowed_origins: str = "*",
        async_mode: str = "threading",
    ) -> SocketIO:
        ...

    def get_socketio(self) -> SocketIO:
        ...

    def run_socketio(self, app: Flask, **kwargs) -> None:
        ...

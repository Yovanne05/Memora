from controllers.realtime.realtime_collaboration_crdt_handlers import (
    register_collaboration_crdt_handlers,
)
from controllers.realtime.realtime_collaboration_session_handlers import (
    register_collaboration_session_handlers,
)
from services.impl.realtime.socketio_service_impl import socketio_service


def register_socketio_handlers():
    socketio = socketio_service.get_socketio()
    register_collaboration_session_handlers(socketio)
    register_collaboration_crdt_handlers(socketio)

from services.impl.realtime.socketio_service_impl import socketio_service


COLLAB_NAMESPACE = "/collaboration"


def test_collaboration_socket_requires_auth(app_client) :
    socketio = socketio_service.get_socketio()
    client = socketio.test_client(app_client.application, namespace = COLLAB_NAMESPACE)

    assert not client.is_connected(COLLAB_NAMESPACE)


def test_collaboration_socket_allows_auth(app_client, auth_context) :
    socketio = socketio_service.get_socketio()
    token = auth_context["token"]

    client = socketio.test_client(
        app_client.application,
        namespace = COLLAB_NAMESPACE,
        auth = {"token" : token},
    )

    assert client.is_connected(COLLAB_NAMESPACE)
    client.disconnect(namespace = COLLAB_NAMESPACE)

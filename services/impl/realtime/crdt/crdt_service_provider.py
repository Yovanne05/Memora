from typing import Optional
import threading

from services.impl.realtime.crdt.crdt_service_impl import CRDTService
from services.interfaces.realtime.crdt_service_interface import (
    CRDTServiceInterface,
)
from utils.logger import get_logger

logger = get_logger(__name__)

_crdt_service: Optional[CRDTServiceInterface] = None
_crdt_service_lock = threading.Lock()


def get_crdt_service() -> CRDTServiceInterface:
    """Return the singleton CRDT service, creating it if missing."""
    global _crdt_service
    if _crdt_service is None:
        with _crdt_service_lock:
            if _crdt_service is None:
                logger.warning(
                    "CRDTService not initialized, creating without Redis client"
                )
                _crdt_service = CRDTService()
    return _crdt_service


def init_crdt_service(redis_client=None) -> CRDTServiceInterface:
    """Initialize the singleton CRDT service with an optional Redis client."""
    global _crdt_service
    with _crdt_service_lock:
        _crdt_service = CRDTService(redis_client=redis_client)
    return _crdt_service

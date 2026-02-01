from __future__ import annotations

from typing import Iterable

try:
    import magic  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    magic = None

try:
    import filetype  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    filetype = None


def sniff_mime(file) -> str:
    """
    Best-effort MIME sniffing using libmagic when available.
    Falls back to the uploaded mimetype.
    """
    pos = file.tell()
    head = file.read(8192)
    file.seek(pos)

    if filetype:
        kind = filetype.guess(head)
        if kind and kind.mime:
            return kind.mime

    if magic:
        try:
            detected = magic.from_buffer(head, mime=True)
            if detected:
                return detected
        except Exception:
            pass
    return getattr(file, "mimetype", None) or getattr(file, "content_type", None) or "application/octet-stream"


def is_allowed_mime(mime: str, allowed: Iterable[str]) -> bool:
    return mime.lower() in {m.lower() for m in allowed}

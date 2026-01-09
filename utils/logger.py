import time
import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, request, g
from datetime import datetime


class InfoFilter(logging.Filter):
    def filter(self, record):
        return record.levelno < logging.ERROR


def get_logger(name: str) -> logging.Logger:
    """Gets a logger instance for the given name."""
    return logging.getLogger(name)


def init_logger(app: Flask):

    log_dir = app.config.get('LOG_DIR', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    app.logger.handlers.clear()

    app.logger.setLevel(logging.INFO)

    info_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app_info.log'),
        maxBytes=10*1024*1024,
        backupCount=5
    )

    info_handler.setLevel(logging.INFO)
    info_handler.addFilter(InfoFilter())
    info_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    info_handler.setFormatter(info_formatter)

    error_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app_error.log'),
        maxBytes=10*1024*1024,
        backupCount=5
    )

    error_handler.setLevel(logging.ERROR)
    error_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    error_handler.setFormatter(error_formatter)

    app.logger.addHandler(info_handler)
    app.logger.addHandler(error_handler)

    @app.before_request
    def log_request():
        g.start_time = time.time()
        g.request_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user_agent = request.headers.get("User-Agent", "N/A")
        app.logger.info(
            f"[REQUEST] {request.method} {request.path} | "
            f"User-Agent: {user_agent[:50]}"
        )

    @app.after_request
    def log_response(response):
        duration = time.time() - g.get("start_time", time.time())
        is_stream = getattr(response, "is_streamed", False) or getattr(
            response, "direct_passthrough", False)

        size_bytes = response.content_length
        raw_body: bytes | None = None

        if size_bytes is None:
            if is_stream:
                size_desc = "stream"
            else:
                raw_body = response.get_data()
                size_bytes = len(raw_body)
                size_desc = f"{size_bytes} bytes"
        else:
            size_desc = f"{size_bytes} bytes"

        log_message = (
            f"[RESPONSE] {request.method} {request.path} | "
            f"Status: {response.status_code} | "
            f"Duration: {duration:.4f}s | "
            f"Size: {size_desc}"
        )

        if 200 <= response.status_code < 400:
            app.logger.info(log_message)
        else:
            if not is_stream:
                try:
                    error_data = response.get_json()
                    log_message += f" | Error: {error_data}"
                except Exception:
                    if raw_body is None:
                        raw_body = response.get_data()
                    error_text = raw_body.decode(errors="replace")[:200]
                    log_message += f" | Error: {error_text}"

            app.logger.error(log_message)

        return response

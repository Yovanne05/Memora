from __future__ import annotations
from pathlib import Path
import yaml
from flasgger import Swagger
import config


def load_definitions(defs_dir: Path) -> dict:
    merged = {"definitions": {}, "parameters": {}}

    for path in defs_dir.glob("*.yaml"):
        with path.open(encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        if "definitions" in data:
            merged["definitions"].update(data["definitions"])

        if "parameters" in data:
            merged["parameters"].update(data["parameters"])

    return merged


def init_swagger(app, *, title: str = "MEMORA", version: str = "1.0.0", base_path: str = "/"):
    if not config.SWAGGER_ENABLED:
        return None

    base = {
        "swagger": "2.0",
        "info": {"title": title, "version": version},
        "basePath": base_path,
        "tags": [
            {"name": "auth"},
            {"name": "users"},
            {"name": "notes"},
            {"name": "collections"},
        ],
        "securityDefinitions": {
            "bearerAuth": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": (
                    "JWT Authorization header using the Bearer scheme.\n\n"
                    "⚠️ Le header doit impérativement commencer par `Bearer ` suivi du token.\n\n"
                    "Exemple:\n"
                    "```\n"
                    "Bearer <token>\n"
                    "```"
                )
            }
        },
        "security": [
            {"bearerAuth": []}
        ],
        "responses": {
            "UnauthorizedError": {
                "description": "Access token is missing or invalid"
            }
        }
    }

    docs_dir = Path(__file__).resolve().parents[1] / "docs" / "definitions"
    defs = load_definitions(docs_dir)

    return Swagger(app, template={**base, **defs})

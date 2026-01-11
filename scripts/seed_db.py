"""Seed script that resets the database and inserts sample data.

Usage:
    python scripts/seed_db.py
"""
import pathlib
from datetime import datetime, timezone
import sys

import bcrypt

# Ensure project root is on the import path
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from utils.db import drop_all, create_all, get_db_session
from utils.enums import (
    ReportReasonEnum,
    ReportStatusEnum,
    RoleEnum,
    SharePermissionEnum,
    VisibilityEnum,
)
from utils.utils import generate_uuid

# Import all DAO models so metadata is registered before create_all
from daos.user_dao import User
from daos.collection_dao import Collection, CollectionShare
from daos.collection_share_link_dao import CollectionShareLink
from daos.note_dao import Note, NoteLink, NoteShare
from daos.note_share_link_dao import NoteShareLink
from daos.note_image_dao import NoteImage
from daos.favorite_dao import CollectionFavorite, NoteFavorite
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from daos.review_dao import Review
from daos.report_dao import Report


def _hash_password(raw_password: str) -> str:
    return bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )


def _reset_database() -> None:
    """Drop and recreate all tables."""
    db_uri = config.SQLALCHEMY_DATABASE_URI
    print(f"Resetting database at {db_uri}")

    # For SQLite, ensure the file exists before recreating tables
    if db_uri.startswith("sqlite:///"):
        db_path = pathlib.Path(db_uri.replace("sqlite:///", ""))
        if db_path.exists():
            db_path.unlink()
            print(f"Removed existing SQLite file: {db_path}")

    drop_all()
    create_all()
    print("Schema recreated.")


def seed() -> None:
    _reset_database()

    with get_db_session() as session:
        # Users
        super_admin = User(
            email="superadmin@example.com",
            username="superadmin",
            password_hash=_hash_password("SuperAdminPass123!"),
            role=RoleEnum.SUPER_ADMIN,
        )
        admin = User(
            email="admin@example.com",
            username="admin",
            password_hash=_hash_password("AdminPass123!"),
            role=RoleEnum.ADMIN,
        )
        client = User(
            email="client@example.com",
            username="client",
            password_hash=_hash_password("ClientPass123!"),
            role=RoleEnum.CLIENT,
        )

        session.add_all([super_admin, admin, client])
        session.flush()
        print("Users inserted.")

        # Collections
        coll_docs = Collection(
            owner_id=super_admin.id,
            name="Project Docs",
            description="Notes publiques du projet.",
            visibility=VisibilityEnum.PUBLIC,
            tags=["project", "docs"],
        )
        coll_templates = Collection(
            owner_id=admin.id,
            name="Templates",
            description="Modeles prets a l'emploi.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["templates"],
        )
        coll_courses = Collection(
            owner_id=client.id,
            name="Cours S5",
            description="Cours et fiches de revision.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["school", "revision"],
        )

        session.add_all([coll_docs, coll_templates, coll_courses])
        session.flush()
        print("Collections inserted.")

        # Notes
        note_archi = Note(
            owner_id=super_admin.id,
            collection_id=coll_docs.id,
            title="Architecture generale",
            visibility=VisibilityEnum.PUBLIC,
            tags=["architecture", "overview"],
        )
        note_api = Note(
            owner_id=super_admin.id,
            collection_id=coll_docs.id,
            title="API checklist",
            visibility=VisibilityEnum.PUBLIC,
            tags=["api", "checklist"],
        )
        note_template = Note(
            owner_id=admin.id,
            collection_id=coll_templates.id,
            title="Template de note",
            visibility=VisibilityEnum.PRIVATE,
            tags=["template"],
        )
        note_course = Note(
            owner_id=client.id,
            collection_id=coll_courses.id,
            title="Memo Flask",
            visibility=VisibilityEnum.PRIVATE,
            tags=["flask", "python"],
        )

        session.add_all([note_archi, note_api, note_template, note_course])
        session.flush()
        print("Notes inserted.")

        # Note links
        session.add(
            NoteLink(
                note_id_1=note_archi.id,
                note_id_2=note_api.id,
                label="related",
            )
        )
        print("Note links inserted.")

        # Shares
        session.add_all(
            [
                CollectionShare(
                    collection_id=coll_docs.id,
                    user_id=admin.id,
                    permission=SharePermissionEnum.READ,
                ),
                NoteShare(
                    note_id=note_api.id,
                    user_id=client.id,
                    permission=SharePermissionEnum.WRITE,
                ),
            ]
        )
        print("Shares inserted.")

        # Favorites
        session.add_all(
            [
                NoteFavorite(user_id=admin.id, note_id=note_archi.id),
                CollectionFavorite(user_id=client.id, collection_id=coll_docs.id),
            ]
        )
        print("Favorites inserted.")

        # Flashcards
        flashcard = Flashcard(
            note_id=note_course.id,
            question="Que fait un blueprint Flask ?",
        )
        session.add(flashcard)
        session.flush()

        session.add_all(
            [
                FlashcardAnswer(
                    flashcard_id=flashcard.id,
                    answer_text="Il regroupe des routes et logiques associees.",
                    is_correct=True,
                ),
                FlashcardAnswer(
                    flashcard_id=flashcard.id,
                    answer_text="Il sert uniquement pour la configuration CORS.",
                    is_correct=False,
                ),
            ]
        )
        print("Flashcards inserted.")

        # Reports
        session.add_all(
            [
                Report(
                    note_id=note_api.id,
                    reporter_id=client.id,
                    reason=ReportReasonEnum.SPAM_OR_ABUSE,
                    status=ReportStatusEnum.PENDING,
                    description="La note semble contenir trop de pub.",
                ),
                Report(
                    collection_id=coll_templates.id,
                    reporter_id=client.id,
                    reason=ReportReasonEnum.TECHNICAL_ISSUE,
                    status=ReportStatusEnum.IN_PROGRESS,
                    description="Impossible de charger certains templates.",
                ),
            ]
        )
        print("Reports inserted.")

        session.flush()
        print("Seed completed successfully.")


if __name__ == "__main__":
    seed()

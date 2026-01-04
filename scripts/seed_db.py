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
from utils.enums import RoleEnum, SharePermissionEnum, VisibilityEnum
from utils.utils import generate_uuid

# Import all DAO models so metadata is registered before create_all
from daos.user_dao import User
from daos.collection_dao import Collection, CollectionShare
from daos.note_dao import Note, NoteLink, NoteShare
from daos.favorite_dao import CollectionFavorite, NoteFavorite
from daos.note_image_dao import NoteImage
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer


def _hash_password(raw_password: str) -> str:
    return bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )


def _reset_database() -> None:
    """Drop and recreate all tables."""
    db_uri = config.get_database_uri()
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
        admin = User(
            email="admin@example.com",
            username="admin",
            display_name="Admin",
            password_hash=_hash_password("Admin123!"),
            role=RoleEnum.ADMIN,
        )
        alice = User(
            email="alice@example.com",
            username="alice",
            display_name="Alice Dupont",
            password_hash=_hash_password("Alice123!"),
            role=RoleEnum.CLIENT,
        )
        bob = User(
            email="bob@example.com",
            username="bob",
            display_name="Bob Martin",
            password_hash=_hash_password("Bob123!"),
            role=RoleEnum.CLIENT,
        )

        session.add_all([admin, alice, bob])
        session.flush()
        print("Users inserted.")

        # Collections
        coll_docs = Collection(
            owner_id=admin.id,
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
            owner_id=alice.id,
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
            owner_id=admin.id,
            collection_id=coll_docs.id,
            title="Architecture generale",
            content="Description de l'architecture et des services.",
            visibility=VisibilityEnum.PUBLIC,
            tags=["architecture", "overview"],
        )
        note_api = Note(
            owner_id=admin.id,
            collection_id=coll_docs.id,
            title="API checklist",
            content="Endpoints, auth, rate-limit et validation.",
            visibility=VisibilityEnum.PUBLIC,
            tags=["api", "checklist"],
        )
        note_template = Note(
            owner_id=admin.id,
            collection_id=coll_templates.id,
            title="Template de note",
            content="Titre, resume, sections, taches et ressources.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["template"],
        )
        note_course = Note(
            owner_id=alice.id,
            collection_id=coll_courses.id,
            title="Memo Flask",
            content="Routes, blueprints, middlewares et tests.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["flask", "python"],
        )

        session.add_all([note_archi, note_api, note_template, note_course])
        session.flush()
        print("Notes inserted.")

        # Note links
        session.add(NoteLink(note_id_1=note_archi.id, note_id_2=note_api.id))
        print("Note links inserted.")

        # Shares
        session.add_all(
            [
                CollectionShare(
                    collection_id=coll_docs.id,
                    user_id=bob.id,
                    permission=SharePermissionEnum.READ,
                ),
                NoteShare(
                    note_id=note_api.id,
                    user_id=bob.id,
                    permission=SharePermissionEnum.WRITE,
                ),
            ]
        )
        print("Shares inserted.")

        # Favorites
        session.add_all(
            [
                NoteFavorite(user_id=bob.id, note_id=note_archi.id),
                CollectionFavorite(user_id=alice.id, collection_id=coll_docs.id),
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

        # Note images
        uploads_dir = pathlib.Path("uploads")
        uploads_dir.mkdir(exist_ok=True)
        session.add(
            NoteImage(
                id=generate_uuid(),
                note_id=note_archi.id,
                file_name="schema-architecture.png",
                file_path=str(uploads_dir / "schema-architecture.png"),
                file_size=204800,
                mime_type="image/png",
                uploaded_at=datetime.now(timezone.utc),
            )
        )
        print("Note images inserted.")

        session.flush()
        print("Seed completed successfully.")


if __name__ == "__main__":
    seed()

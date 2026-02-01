"""Initialize the database schema and create a super admin user.

Usage:
    python scripts/init_db.py --email user@example.com --username superadmin --password 'StrongPass123!'
    python scripts/init_db.py --email user@example.com --username superadmin --password 'StrongPass123!' --update-existing
    python scripts/init_db.py --email user@example.com --username superadmin --password 'StrongPass123!' --reset
"""
import argparse
import pathlib
import sys

import bcrypt
from sqlalchemy import create_engine, select, text
from sqlalchemy.engine.url import make_url

# Ensure project root is on the import path
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from utils.db import create_all, drop_all, get_db_session
from utils.enums import RoleEnum
from utils.security import PASSWORD_VALIDATION_ERROR, is_password_strong

# Import all DAO models so metadata is registered before create_all
from daos.user_dao import User
from daos.collection_dao import Collection, CollectionShare
from daos.collection_share_link_dao import CollectionShareLink
from daos.crdt_snapshot_dao import CRDTSnapshot
from daos.favorite_dao import CollectionFavorite, NoteFavorite
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from daos.note_collaboration_dao import NoteCollaborationHistory
from daos.note_dao import Note, NoteLink, NoteShare
from daos.note_image_dao import NoteImage
from daos.note_share_link_dao import NoteShareLink
from daos.report_dao import Report
from daos.review_dao import Review


def _ensure_postgres_database(db_uri: str) -> None:
    url = make_url(db_uri)
    if not url.database:
        return

    admin_url = url.set(database="postgres")
    engine = create_engine(
        admin_url,
        isolation_level="AUTOCOMMIT",
        future=True,
        pool_pre_ping=True,
    )
    db_name = url.database.replace('"', '""')
    try:
        with engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": url.database},
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                print(f"Created database: {url.database}")
    finally:
        engine.dispose()


def _hash_password(raw_password: str) -> str:
    hashed = bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def _validate_password(raw_password: str) -> None:
    if not is_password_strong(raw_password):
        raise ValueError(PASSWORD_VALIDATION_ERROR)


def _ensure_database_ready(reset: bool) -> None:
    db_uri = config.SQLALCHEMY_DATABASE_URI
    if not db_uri:
        raise ValueError("SQLALCHEMY_DATABASE_URI is not set.")

    if not db_uri.startswith("sqlite:///"):
        url = make_url(db_uri)
        if url.drivername.startswith("postgresql"):
            _ensure_postgres_database(db_uri)

    if reset:
        drop_all()
    create_all()


def _find_existing_user(session, email: str, username: str) -> User | None:
    existing_by_email = session.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()
    existing_by_username = session.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()

    if (
        existing_by_email
        and existing_by_username
        and existing_by_email.id != existing_by_username.id
    ):
        raise ValueError("Email and username already belong to different users.")

    return existing_by_email or existing_by_username


def init_db(
    email: str,
    username: str,
    password: str,
    update_existing: bool,
    reset: bool,
) -> None:
    _validate_password(password)
    _ensure_database_ready(reset)

    with get_db_session() as session:
        existing = _find_existing_user(session, email, username)
        password_hash = _hash_password(password)

        if existing:
            if not update_existing:
                print(
                    "User already exists. Use --update-existing to overwrite credentials."
                )
                return
            existing.email = email
            existing.username = username
            existing.password_hash = password_hash
            existing.role = RoleEnum.SUPER_ADMIN
            session.add(existing)
            print(f"Updated super admin: {existing.id}")
            return

        super_admin = User(
            email=email,
            username=username,
            password_hash=password_hash,
            role=RoleEnum.SUPER_ADMIN,
        )
        session.add(super_admin)
        session.flush()
        print(f"Created super admin: {super_admin.id}")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Initialize database schema and create a super admin user."
    )
    parser.add_argument("--email", required=True, help="Super admin email")
    parser.add_argument("--username", required=True, help="Super admin username")
    parser.add_argument("--password", required=True, help="Super admin password")
    parser.add_argument(
        "--update-existing",
        action="store_true",
        help="Update existing user if email or username already exists.",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop all tables before creating them.",
    )
    return parser.parse_args()


def main() -> int:
    args = _parse_args()
    try:
        init_db(
            email=args.email,
            username=args.username,
            password=args.password,
            update_existing=args.update_existing,
            reset=args.reset,
        )
    except ValueError as exc:
        print(f"Error: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

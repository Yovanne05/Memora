"""Seed script that resets the database and inserts sample data for demo scenarios.

Usage:
    python scripts/seed_db.py

Scenarios:
    1. Sophie - Médecine naturelle (apprentissage long terme, notes interconnectées)
    2. Luc - Projet étudiant (organisation équipe, partages)
    3. Andréas - Révisions rapides (flashcards, mobile)
    4. Marianne - Enseignante (brouillons, mutualisation collègues)
"""
import pathlib
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import random

import bcrypt
from sqlalchemy import create_engine, text
from sqlalchemy.engine.url import make_url

# Ensure project root is on the import path
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from utils.db import drop_all, create_all, get_db_session
from utils.enums import (
    ReportReasonEnum,
    ReportStatusEnum,
    ReviewDifficultyEnum,
    RoleEnum,
    SharePermissionEnum,
    VisibilityEnum,
)

# Import all DAO models so metadata is registered before create_all
from daos.user_dao import User
from daos.collection_dao import Collection, CollectionShare
from daos.collection_share_link_dao import CollectionShareLink
from daos.note_dao import Note, NoteLink
from daos.note_share_link_dao import NoteShareLink
from daos.note_image_dao import NoteImage
from daos.note_collaboration_dao import NoteCollaborationHistory
from daos.crdt_snapshot_dao import CRDTSnapshot
from daos.favorite_dao import CollectionFavorite, NoteFavorite
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from daos.review_dao import Review
from daos.report_dao import Report

# Import content from modules
from seed_data.helpers import _text, _paragraph, _heading, _bullet_list, _ordered_list, _code_block, _doc
from seed_data.sophie_content import SOPHIE_NOTES_CONTENT, SOPHIE_FLASHCARDS
from seed_data.luc_content import LUC_NOTES_CONTENT
from seed_data.andreas_content import ANDREAS_NOTES_CONTENT, ANDREAS_FLASHCARDS
from seed_data.marianne_content import MARIANNE_NOTES_CONTENT, MARIANNE_FLASHCARDS


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
    else:
        url = make_url(db_uri)
        if url.drivername.startswith("postgresql"):
            _ensure_postgres_database(db_uri)

    drop_all()
    create_all()
    print("Schema recreated.")


def seed() -> None:
    _reset_database()

    with get_db_session() as session:
        # =====================================================================
        # UTILISATEURS
        # =====================================================================
        super_admin = User(
            email="superadmin@memora.fr",
            username="superadmin",
            password_hash=_hash_password("SuperAdmin123!"),
            role=RoleEnum.SUPER_ADMIN,
        )
        admin = User(
            email="admin@memora.fr",
            username="admin",
            password_hash=_hash_password("AdminPass123!"),
            role=RoleEnum.ADMIN,
        )

        # Scénario 1: Sophie - Médecine naturelle
        sophie = User(
            email="sophie.martin@email.fr",
            username="sophie",
            password_hash=_hash_password("SophiePass123!"),
            role=RoleEnum.CLIENT,
        )

        # Scénario 2: Luc - Projet étudiant
        luc = User(
            email="luc.dupont@etudiant.fr",
            username="luc",
            password_hash=_hash_password("LucDupont123!"),
            role=RoleEnum.CLIENT,
        )
        # Camarades de Luc
        emma = User(
            email="emma.bernard@etudiant.fr",
            username="emma",
            password_hash=_hash_password("EmmaBernard123!"),
            role=RoleEnum.CLIENT,
        )
        thomas = User(
            email="thomas.petit@etudiant.fr",
            username="thomas",
            password_hash=_hash_password("ThomasPetit123!"),
            role=RoleEnum.CLIENT,
        )
        julie = User(
            email="julie.moreau@etudiant.fr",
            username="julie",
            password_hash=_hash_password("JulieMoreau123!"),
            role=RoleEnum.CLIENT,
        )

        # Scénario 3: Andréas - Révisions rapides
        andreas = User(
            email="andreas.schmidt@etudiant.fr",
            username="andreas",
            password_hash=_hash_password("AndreasPass123!"),
            role=RoleEnum.CLIENT,
        )

        # Scénario 4: Marianne - Enseignante
        marianne = User(
            email="marianne.leroy@universite.fr",
            username="marianne",
            password_hash=_hash_password("MariannePass123!"),
            role=RoleEnum.CLIENT,
        )
        # Collègues de Marianne
        pierre = User(
            email="pierre.dubois@universite.fr",
            username="pierre",
            password_hash=_hash_password("PierrePass123!"),
            role=RoleEnum.CLIENT,
        )
        claire = User(
            email="claire.rousseau@universite.fr",
            username="claire",
            password_hash=_hash_password("ClairePass123!"),
            role=RoleEnum.CLIENT,
        )
        # Étudiants de Marianne
        etudiant1 = User(
            email="maxime.girard@etudiant.fr",
            username="maxime",
            password_hash=_hash_password("MaximeGirard123!"),
            role=RoleEnum.CLIENT,
        )
        etudiant2 = User(
            email="lea.fontaine@etudiant.fr",
            username="lea",
            password_hash=_hash_password("LeaFontaine123!"),
            role=RoleEnum.CLIENT,
        )
        etudiant3 = User(
            email="hugo.lambert@etudiant.fr",
            username="hugo",
            password_hash=_hash_password("HugoLambert123!"),
            role=RoleEnum.CLIENT,
        )

        session.add_all([
            super_admin, admin,
            sophie,
            luc, emma, thomas, julie,
            andreas,
            marianne, pierre, claire, etudiant1, etudiant2, etudiant3
        ])
        session.flush()
        print("Users inserted (14 users).")

        # =====================================================================
        # SCÉNARIO 1: SOPHIE - Médecine naturelle (apprentissage long terme)
        # =====================================================================
        coll_phyto = Collection(
            owner_id=sophie.id,
            name="Phytothérapie",
            description="Cours et fiches sur les plantes médicinales et leurs usages thérapeutiques.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["phytothérapie", "plantes", "médecine naturelle"],
        )
        coll_aroma = Collection(
            owner_id=sophie.id,
            name="Aromathérapie",
            description="Huiles essentielles et leurs applications en santé naturelle.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["aromathérapie", "huiles essentielles"],
        )
        coll_patho = Collection(
            owner_id=sophie.id,
            name="Pathologies courantes",
            description="Approches naturelles des troubles de santé fréquents.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["pathologies", "troubles", "santé"],
        )

        session.add_all([coll_phyto, coll_aroma, coll_patho])
        session.flush()

        # Notes de Sophie - Phytothérapie (plantes individuelles)
        sophie_notes = {}
        phyto_notes_data = [
            ("Phytothérapie - Introduction", ["phytothérapie", "bases", "introduction"]),
            ("Camomille romaine", ["camomille", "digestif", "calmant"]),
            ("Lavande officinale", ["lavande", "anxiolytique", "cicatrisant"]),
            ("Valériane", ["valériane", "sommeil", "sédatif"]),
            ("Millepertuis", ["millepertuis", "antidépresseur", "interactions"]),
            ("Échinacée - Immunité", ["échinacée", "immunité", "infections"]),
            ("Menthe poivrée", ["menthe", "digestif", "céphalées"]),
            ("Gingembre", ["gingembre", "nausées", "anti-inflammatoire"]),
            ("Passiflore", ["passiflore", "anxiété", "sommeil"]),
            ("Aubépine", ["aubépine", "coeur", "palpitations"]),
            ("Thym", ["thym", "respiratoire", "antiseptique"]),
            ("Romarin", ["romarin", "foie", "mémoire"]),
            ("Propolis", ["propolis", "immunité", "gorge"]),
        ]
        for title, tags in phyto_notes_data:
            note = Note(
                owner_id=sophie.id,
                collection_id=coll_phyto.id,
                title=title,
                content=SOPHIE_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            sophie_notes[title] = note

        # Notes de Sophie - Aromathérapie (HE)
        aroma_notes_data = [
            ("Aromathérapie - Bases", ["aromathérapie", "bases", "HE"]),
            ("Tea tree - Antiseptique", ["tea tree", "antiseptique", "infections"]),
            ("Ravintsara", ["ravintsara", "antiviral", "immunité"]),
            ("Eucalyptus radiata", ["eucalyptus", "respiratoire", "expectorant"]),
        ]
        for title, tags in aroma_notes_data:
            note = Note(
                owner_id=sophie.id,
                collection_id=coll_aroma.id,
                title=title,
                content=SOPHIE_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            sophie_notes[title] = note

        # Notes de Sophie - Pathologies (approches par système)
        patho_notes_data = [
            ("Troubles digestifs - Approche", ["digestion", "dyspepsie", "foie"]),
            ("Stress et anxiété", ["stress", "anxiété", "adaptogènes"]),
            ("Pathologies hivernales", ["rhume", "toux", "immunité"]),
            ("Gestion du sommeil", ["sommeil", "insomnie", "sédatifs"]),
            ("Douleurs articulaires", ["articulations", "arthrose", "anti-inflammatoire"]),
            ("Détox hépatique", ["foie", "détox", "chardon-marie"]),
            ("Circulation veineuse", ["veines", "jambes lourdes", "veinotonique"]),
            ("Système nerveux - Vue globale", ["nerveux", "stress", "sommeil"]),
            ("Système digestif - Vue globale", ["digestif", "intestin", "foie"]),
            ("Système immunitaire - Vue globale", ["immunité", "défenses", "infections"]),
        ]
        for title, tags in patho_notes_data:
            note = Note(
                owner_id=sophie.id,
                collection_id=coll_patho.id,
                title=title,
                content=SOPHIE_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            sophie_notes[title] = note

        session.flush()
        print("Sophie's collections and notes inserted (27 notes).")

        # Liens entre notes de Sophie - RÉSEAU DENSE INTERCONNECTÉ
        sophie_links = [
            # Introduction → Plantes
            ("Phytothérapie - Introduction", "Camomille romaine", "exemple plante"),
            ("Phytothérapie - Introduction", "Lavande officinale", "exemple plante"),
            ("Phytothérapie - Introduction", "Valériane", "exemple plante"),
            ("Phytothérapie - Introduction", "Aromathérapie - Bases", "discipline connexe"),

            # Plantes digestives → Pathologies digestives
            ("Camomille romaine", "Troubles digestifs - Approche", "indication"),
            ("Camomille romaine", "Gestion du sommeil", "indication secondaire"),
            ("Menthe poivrée", "Troubles digestifs - Approche", "indication principale"),
            ("Menthe poivrée", "Système digestif - Vue globale", "antispasmodique"),
            ("Gingembre", "Troubles digestifs - Approche", "nausées"),
            ("Gingembre", "Douleurs articulaires", "anti-inflammatoire"),
            ("Romarin", "Détox hépatique", "hépatoprotecteur"),
            ("Romarin", "Système digestif - Vue globale", "stimulant biliaire"),

            # Plantes nerveuses → Pathologies nerveuses
            ("Lavande officinale", "Stress et anxiété", "anxiolytique"),
            ("Lavande officinale", "Gestion du sommeil", "sédatif doux"),
            ("Lavande officinale", "Aromathérapie - Bases", "HE majeure"),
            ("Valériane", "Gestion du sommeil", "indication principale"),
            ("Valériane", "Stress et anxiété", "anxiolytique"),
            ("Valériane", "Système nerveux - Vue globale", "sédatif"),
            ("Passiflore", "Stress et anxiété", "anxiolytique rapide"),
            ("Passiflore", "Gestion du sommeil", "indication"),
            ("Passiflore", "Système nerveux - Vue globale", "anxiolytique"),
            ("Passiflore", "Valériane", "synergie"),
            ("Aubépine", "Stress et anxiété", "palpitations"),
            ("Aubépine", "Système nerveux - Vue globale", "cardio-nerveux"),
            ("Aubépine", "Passiflore", "synergie"),
            ("Millepertuis", "Stress et anxiété", "antidépresseur"),
            ("Millepertuis", "Système nerveux - Vue globale", "antidépresseur"),

            # Plantes immunitaires → Pathologies hivernales
            ("Échinacée - Immunité", "Pathologies hivernales", "prévention"),
            ("Échinacée - Immunité", "Système immunitaire - Vue globale", "immunostimulant"),
            ("Thym", "Pathologies hivernales", "antiseptique respiratoire"),
            ("Thym", "Système immunitaire - Vue globale", "anti-infectieux"),
            ("Propolis", "Pathologies hivernales", "protection gorge"),
            ("Propolis", "Système immunitaire - Vue globale", "immunostimulant"),

            # HE → Pathologies
            ("Tea tree - Antiseptique", "Aromathérapie - Bases", "HE courante"),
            ("Tea tree - Antiseptique", "Pathologies hivernales", "antiseptique"),
            ("Tea tree - Antiseptique", "Système immunitaire - Vue globale", "anti-infectieux"),
            ("Ravintsara", "Pathologies hivernales", "antiviral majeur"),
            ("Ravintsara", "Système immunitaire - Vue globale", "antiviral"),
            ("Ravintsara", "Aromathérapie - Bases", "HE douce"),
            ("Eucalyptus radiata", "Pathologies hivernales", "expectorant"),
            ("Eucalyptus radiata", "Aromathérapie - Bases", "HE respiratoire"),

            # Liens inter-pathologies (vues globales ↔ approches spécifiques)
            ("Système nerveux - Vue globale", "Stress et anxiété", "détail"),
            ("Système nerveux - Vue globale", "Gestion du sommeil", "détail"),
            ("Système digestif - Vue globale", "Troubles digestifs - Approche", "détail"),
            ("Système digestif - Vue globale", "Détox hépatique", "lien hépatique"),
            ("Système immunitaire - Vue globale", "Pathologies hivernales", "application"),

            # Liens transversaux inter-systèmes
            ("Stress et anxiété", "Gestion du sommeil", "trouble associé"),
            ("Stress et anxiété", "Troubles digestifs - Approche", "composante nerveuse"),
            ("Détox hépatique", "Troubles digestifs - Approche", "lien hépatobiliaire"),
            ("Douleurs articulaires", "Aromathérapie - Bases", "usage externe HE"),
            ("Circulation veineuse", "Aromathérapie - Bases", "HE veinotoniques"),
        ]
        for src, tgt, label in sophie_links:
            if src in sophie_notes and tgt in sophie_notes:
                session.add(NoteLink(
                    note_id_1=sophie_notes[src].id,
                    note_id_2=sophie_notes[tgt].id,
                    label=label,
                ))
        print("Sophie's note links inserted (52 links).")

        # Flashcards de Sophie
        for question, answers in SOPHIE_FLASHCARDS:
            # Trouver une note pertinente pour la flashcard
            note_id = sophie_notes["Phytothérapie - Introduction"].id
            fc = Flashcard(note_id=note_id, question=question)
            session.add(fc)
            session.flush()
            for answer_text, is_correct in answers:
                session.add(FlashcardAnswer(
                    flashcard_id=fc.id,
                    answer_text=answer_text,
                    is_correct=is_correct,
                ))
        print("Sophie's flashcards inserted (10 flashcards).")

        # =====================================================================
        # SCÉNARIO 2: LUC - Projet étudiant (organisation équipe)
        # =====================================================================
        coll_projet = Collection(
            owner_id=luc.id,
            name="Projet TaskManager",
            description="Documentation et notes du projet de gestion de tâches - S5.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["projet", "S5", "équipe"],
        )
        coll_reunions = Collection(
            owner_id=luc.id,
            name="Comptes-rendus réunions",
            description="CR des sprints et réunions d'équipe.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["réunions", "sprints", "CR"],
        )
        coll_ressources = Collection(
            owner_id=luc.id,
            name="Ressources techniques",
            description="Guides et références techniques partagées.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["ressources", "guides", "technique"],
        )

        session.add_all([coll_projet, coll_reunions, coll_ressources])
        session.flush()

        # Notes de Luc - Projet (documentation technique)
        luc_notes = {}
        projet_notes_data = [
            ("Architecture projet", ["architecture", "stack", "structure"]),
            ("API REST - Endpoints", ["API", "REST", "endpoints"]),
            ("Modèle de données", ["BDD", "Prisma", "modèle"]),
            ("Guide React hooks", ["React", "hooks", "frontend"]),
            ("WebSocket - Temps réel", ["websocket", "temps réel", "notifications"]),
            ("Authentification JWT", ["JWT", "auth", "sécurité"]),
            ("Gestion d'erreurs", ["erreurs", "exceptions", "backend"]),
            ("React Query - Cache", ["cache", "React Query", "performance"]),
            ("Kanban - Drag & Drop", ["kanban", "drag drop", "UI"]),
            ("Validation - Zod", ["validation", "Zod", "schémas"]),
        ]
        for title, tags in projet_notes_data:
            note = Note(
                owner_id=luc.id,
                collection_id=coll_projet.id,
                title=title,
                content=LUC_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            luc_notes[title] = note

        # Notes de Luc - Réunions
        reunions_notes_data = [
            ("Réunion Sprint 1", ["sprint", "CR", "S1"]),
            ("Réunion Sprint 2", ["sprint", "CR", "S2"]),
            ("Réunion Sprint 3", ["sprint", "CR", "S3"]),
        ]
        for title, tags in reunions_notes_data:
            note = Note(
                owner_id=luc.id,
                collection_id=coll_reunions.id,
                title=title,
                content=LUC_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            luc_notes[title] = note

        # Notes de Luc - Ressources
        ressources_notes_data = [
            ("Setup environnement", ["setup", "installation", "dev"]),
            ("Tests - Guide", ["tests", "pytest", "qualité"]),
            ("Déploiement CI/CD", ["CI/CD", "GitHub Actions", "deploy"]),
            ("Design System", ["design", "UI", "couleurs"]),
            ("Performance - Optimisations", ["performance", "optimisation", "métriques"]),
        ]
        for title, tags in ressources_notes_data:
            note = Note(
                owner_id=luc.id,
                collection_id=coll_ressources.id,
                title=title,
                content=LUC_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            luc_notes[title] = note

        session.flush()
        print("Luc's collections and notes inserted (18 notes).")

        # Liens entre notes de Luc - RÉSEAU DENSE
        luc_links = [
            # Architecture centrale
            ("Architecture projet", "API REST - Endpoints", "définit API"),
            ("Architecture projet", "Modèle de données", "définit modèle"),
            ("Architecture projet", "Guide React hooks", "définit frontend"),
            ("Architecture projet", "WebSocket - Temps réel", "définit temps réel"),
            ("Architecture projet", "Authentification JWT", "définit auth"),

            # API et données
            ("API REST - Endpoints", "Modèle de données", "utilise modèle"),
            ("API REST - Endpoints", "Authentification JWT", "sécurise"),
            ("API REST - Endpoints", "Gestion d'erreurs", "gère erreurs"),
            ("API REST - Endpoints", "Validation - Zod", "valide données"),

            # Frontend React
            ("Guide React hooks", "React Query - Cache", "utilise cache"),
            ("Guide React hooks", "Kanban - Drag & Drop", "implémente"),
            ("Guide React hooks", "Design System", "utilise styles"),
            ("React Query - Cache", "API REST - Endpoints", "appelle API"),
            ("React Query - Cache", "Performance - Optimisations", "optimise"),
            ("Kanban - Drag & Drop", "WebSocket - Temps réel", "synchronise"),

            # Backend
            ("Authentification JWT", "Gestion d'erreurs", "gère erreurs auth"),
            ("WebSocket - Temps réel", "Authentification JWT", "vérifie auth"),
            ("Validation - Zod", "Gestion d'erreurs", "erreurs validation"),

            # Sprints
            ("Réunion Sprint 1", "Architecture projet", "définit architecture"),
            ("Réunion Sprint 1", "Setup environnement", "setup initial"),
            ("Réunion Sprint 2", "Réunion Sprint 1", "suite"),
            ("Réunion Sprint 2", "Kanban - Drag & Drop", "implémente kanban"),
            ("Réunion Sprint 3", "Réunion Sprint 2", "suite"),
            ("Réunion Sprint 3", "WebSocket - Temps réel", "implémente temps réel"),
            ("Réunion Sprint 3", "Performance - Optimisations", "optimise perf"),

            # Ressources transverses
            ("Setup environnement", "Architecture projet", "prérequis"),
            ("Tests - Guide", "Déploiement CI/CD", "étape CI"),
            ("Tests - Guide", "API REST - Endpoints", "teste API"),
            ("Tests - Guide", "Gestion d'erreurs", "teste erreurs"),
            ("Déploiement CI/CD", "Performance - Optimisations", "métriques CI"),
            ("Design System", "Kanban - Drag & Drop", "styles kanban"),
            ("Performance - Optimisations", "React Query - Cache", "cache optimisé"),
        ]
        for src, tgt, label in luc_links:
            if src in luc_notes and tgt in luc_notes:
                session.add(NoteLink(
                    note_id_1=luc_notes[src].id,
                    note_id_2=luc_notes[tgt].id,
                    label=label,
                ))
        print("Luc's note links inserted (32 links).")

        # Partages de Luc avec son équipe
        # Collection projet partagée en écriture avec l'équipe
        session.add_all([
            CollectionShare(
                collection_id=coll_projet.id,
                user_id=emma.id,
                permission=SharePermissionEnum.WRITE,
            ),
            CollectionShare(
                collection_id=coll_projet.id,
                user_id=thomas.id,
                permission=SharePermissionEnum.WRITE,
            ),
            CollectionShare(
                collection_id=coll_projet.id,
                user_id=julie.id,
                permission=SharePermissionEnum.READ,
            ),
            CollectionShare(
                collection_id=coll_reunions.id,
                user_id=emma.id,
                permission=SharePermissionEnum.READ,
            ),
            CollectionShare(
                collection_id=coll_reunions.id,
                user_id=thomas.id,
                permission=SharePermissionEnum.READ,
            ),
            CollectionShare(
                collection_id=coll_reunions.id,
                user_id=julie.id,
                permission=SharePermissionEnum.READ,
            ),
            CollectionShare(
                collection_id=coll_ressources.id,
                user_id=emma.id,
                permission=SharePermissionEnum.WRITE,
            ),
            CollectionShare(
                collection_id=coll_ressources.id,
                user_id=thomas.id,
                permission=SharePermissionEnum.WRITE,
            ),
        ])
        print("Luc's team shares inserted (8 shares).")

        # =====================================================================
        # SCÉNARIO 3: ANDRÉAS - Révisions rapides (mobile, flashcards)
        # =====================================================================
        coll_algo = Collection(
            owner_id=andreas.id,
            name="Algorithmique",
            description="Fiches de révision rapide - Algorithmes et structures de données.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["algo", "révision", "examen"],
        )
        coll_bdd = Collection(
            owner_id=andreas.id,
            name="Bases de données",
            description="SQL et conception de bases de données.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["SQL", "BDD", "révision"],
        )
        coll_dev = Collection(
            owner_id=andreas.id,
            name="Développement",
            description="POO, patterns et bonnes pratiques.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["POO", "patterns", "dev"],
        )

        session.add_all([coll_algo, coll_bdd, coll_dev])
        session.flush()

        # Notes d'Andréas - Algorithmique
        andreas_notes = {}
        algo_notes_data = [
            ("Algo - Complexité", ["complexité", "O(n)", "performance"]),
            ("Algo - Tri", ["tri", "quicksort", "mergesort"]),
            ("Algo - Graphes", ["graphes", "BFS", "DFS"]),
            ("Algo - Structures de données", ["structures", "pile", "file"]),
            ("Algo - Récursivité", ["récursivité", "factorielle", "fibonacci"]),
            ("Algo - Programmation dynamique", ["DP", "mémoïsation", "tabulation"]),
        ]
        for title, tags in algo_notes_data:
            note = Note(
                owner_id=andreas.id,
                collection_id=coll_algo.id,
                title=title,
                content=ANDREAS_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            andreas_notes[title] = note

        # Notes d'Andréas - Base de données
        bdd_notes_data = [
            ("SQL - Bases", ["SQL", "SELECT", "JOIN"]),
            ("SQL - Avancé", ["SQL", "CTE", "Window"]),
            ("SQL - Transactions", ["ACID", "transaction", "isolation"]),
            ("SQL - Modélisation", ["normalisation", "relations", "clés"]),
        ]
        for title, tags in bdd_notes_data:
            note = Note(
                owner_id=andreas.id,
                collection_id=coll_bdd.id,
                title=title,
                content=ANDREAS_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            andreas_notes[title] = note

        # Notes d'Andréas - Développement
        dev_notes_data = [
            ("POO - Principes", ["POO", "SOLID", "encapsulation"]),
            ("Design Patterns", ["patterns", "singleton", "factory"]),
            ("Git - Commandes", ["git", "versionning", "commandes"]),
            ("HTTP - Protocole", ["HTTP", "REST", "API"]),
            ("React - Hooks", ["React", "hooks", "frontend"]),
            ("TypeScript - Types", ["TypeScript", "types", "interfaces"]),
            ("Docker - Bases", ["Docker", "containers", "images"]),
            ("Réseau - OSI", ["OSI", "TCP", "UDP"]),
            ("Sécurité - Bases", ["sécurité", "OWASP", "auth"]),
        ]
        for title, tags in dev_notes_data:
            note = Note(
                owner_id=andreas.id,
                collection_id=coll_dev.id,
                title=title,
                content=ANDREAS_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PRIVATE,
                tags=tags,
            )
            session.add(note)
            andreas_notes[title] = note

        session.flush()
        print("Andreas's collections and notes inserted (19 notes).")

        # Liens entre notes d'Andréas - RÉSEAU INTERCONNECTÉ
        andreas_links = [
            # Algo - liens internes
            ("Algo - Complexité", "Algo - Tri", "analyse tri"),
            ("Algo - Complexité", "Algo - Graphes", "analyse graphes"),
            ("Algo - Complexité", "Algo - Structures de données", "analyse structures"),
            ("Algo - Tri", "Algo - Récursivité", "quicksort récursif"),
            ("Algo - Graphes", "Algo - Récursivité", "DFS récursif"),
            ("Algo - Récursivité", "Algo - Programmation dynamique", "optimisation"),
            ("Algo - Programmation dynamique", "Algo - Complexité", "améliore complexité"),
            ("Algo - Structures de données", "Algo - Graphes", "représentation graphe"),

            # SQL - liens internes
            ("SQL - Bases", "SQL - Avancé", "approfondir"),
            ("SQL - Avancé", "SQL - Transactions", "gestion données"),
            ("SQL - Modélisation", "SQL - Bases", "conception BDD"),
            ("SQL - Modélisation", "SQL - Transactions", "intégrité"),

            # Dev - liens internes
            ("POO - Principes", "Design Patterns", "applique SOLID"),
            ("POO - Principes", "TypeScript - Types", "typage OOP"),
            ("Design Patterns", "React - Hooks", "patterns frontend"),
            ("HTTP - Protocole", "React - Hooks", "appels API"),
            ("HTTP - Protocole", "Sécurité - Bases", "HTTPS"),
            ("TypeScript - Types", "React - Hooks", "typage React"),
            ("Docker - Bases", "Réseau - OSI", "réseau containers"),
            ("Sécurité - Bases", "SQL - Bases", "injection SQL"),

            # Liens inter-collections
            ("Algo - Structures de données", "SQL - Modélisation", "structures données"),
            ("Algo - Graphes", "SQL - Avancé", "requêtes récursives"),
            ("POO - Principes", "SQL - Modélisation", "modèle objet-relationnel"),
            ("Git - Commandes", "Docker - Bases", "workflow dev"),
            ("HTTP - Protocole", "SQL - Bases", "API backend"),
            ("Réseau - OSI", "HTTP - Protocole", "couche application"),
            ("Sécurité - Bases", "HTTP - Protocole", "HTTPS sécurisé"),
        ]
        for src, tgt, label in andreas_links:
            if src in andreas_notes and tgt in andreas_notes:
                session.add(NoteLink(
                    note_id_1=andreas_notes[src].id,
                    note_id_2=andreas_notes[tgt].id,
                    label=label,
                ))
        print("Andreas's note links inserted (27 links).")

        # Flashcards d'Andréas avec historique de révision
        andreas_flashcard_objects = []
        for question, answers in ANDREAS_FLASHCARDS:
            note_id = andreas_notes["Algo - Complexité"].id
            fc = Flashcard(note_id=note_id, question=question)
            session.add(fc)
            session.flush()
            correct_answer = None
            for answer_text, is_correct in answers:
                ans = FlashcardAnswer(
                    flashcard_id=fc.id,
                    answer_text=answer_text,
                    is_correct=is_correct,
                )
                session.add(ans)
                if is_correct:
                    correct_answer = ans
            session.flush()
            andreas_flashcard_objects.append((fc, correct_answer))

        print("Andreas's flashcards inserted (10 flashcards).")

        # Historique de révision pour Andréas (données SM2)
        now = datetime.now(timezone.utc)
        difficulties = [
            ReviewDifficultyEnum.EASY,
            ReviewDifficultyEnum.GOOD,
            ReviewDifficultyEnum.GOOD,
            ReviewDifficultyEnum.HARD,
            ReviewDifficultyEnum.EASY,
            ReviewDifficultyEnum.GOOD,
            ReviewDifficultyEnum.AGAIN,
            ReviewDifficultyEnum.GOOD,
            ReviewDifficultyEnum.EASY,
            ReviewDifficultyEnum.GOOD,
        ]
        for i, (fc, correct_ans) in enumerate(andreas_flashcard_objects):
            if correct_ans:
                diff = difficulties[i % len(difficulties)]
                is_correct = diff != ReviewDifficultyEnum.AGAIN
                e_factor = Decimal("2.5") if is_correct else Decimal("2.3")
                interval = random.randint(1, 7) if is_correct else 1
                session.add(Review(
                    user_id=andreas.id,
                    flashcard_id=fc.id,
                    selected_answer_id=correct_ans.id,
                    is_correct=is_correct,
                    difficulty=diff,
                    e_factor=e_factor,
                    repetitions=random.randint(1, 5),
                    interval_days=interval,
                    next_review_at=now + timedelta(days=interval),
                    reviewed_at=now - timedelta(days=random.randint(1, 3)),
                ))
        print("Andreas's review history inserted (10 reviews).")

        # =====================================================================
        # SCÉNARIO 4: MARIANNE - Enseignante (brouillons, mutualisation)
        # =====================================================================
        # Collections publiques (cours finalisés pour étudiants)
        coll_intro_prog = Collection(
            owner_id=marianne.id,
            name="Introduction à la programmation",
            description="Cours d'initiation à la programmation en Python - L1.",
            visibility=VisibilityEnum.PUBLIC,
            tags=["Python", "L1", "introduction"],
        )
        coll_poo = Collection(
            owner_id=marianne.id,
            name="Programmation Orientée Objet",
            description="Cours de POO en Python - L2.",
            visibility=VisibilityEnum.PUBLIC,
            tags=["POO", "L2", "Python"],
        )
        # Collection privée (brouillons en cours)
        coll_brouillons = Collection(
            owner_id=marianne.id,
            name="Brouillons - Nouveau cours",
            description="Travail en cours sur le nouveau module.",
            visibility=VisibilityEnum.PRIVATE,
            tags=["brouillon", "WIP"],
        )

        session.add_all([coll_intro_prog, coll_poo, coll_brouillons])
        session.flush()

        # Notes de Marianne - Introduction programmation (PUBLIC)
        marianne_notes = {}
        intro_notes_data = [
            ("Intro Programmation", ["intro", "bases", "algorithme"]),
            ("Variables et Types", ["variables", "types", "données"]),
            ("Structures de contrôle", ["if", "conditions", "contrôle"]),
            ("Boucles", ["for", "while", "itération"]),
            ("Fonctions", ["fonctions", "paramètres", "return"]),
            ("Listes et Dictionnaires", ["listes", "dictionnaires", "collections"]),
            ("Fichiers", ["fichiers", "lecture", "écriture"]),
            ("Exceptions", ["exceptions", "try", "except"]),
        ]
        for title, tags in intro_notes_data:
            note = Note(
                owner_id=marianne.id,
                collection_id=coll_intro_prog.id,
                title=title,
                content=MARIANNE_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PUBLIC,
                tags=tags,
            )
            session.add(note)
            marianne_notes[title] = note

        # Notes de Marianne - POO (PUBLIC)
        poo_notes_data = [
            ("POO Bases", ["classes", "objets", "méthodes"]),
            ("POO Héritage", ["héritage", "polymorphisme", "abstraction"]),
            ("Tests unitaires", ["tests", "pytest", "TDD"]),
            ("Bonnes pratiques", ["PEP8", "DRY", "KISS"]),
        ]
        for title, tags in poo_notes_data:
            note = Note(
                owner_id=marianne.id,
                collection_id=coll_poo.id,
                title=title,
                content=MARIANNE_NOTES_CONTENT.get(title, ""),
                visibility=VisibilityEnum.PUBLIC,
                tags=tags,
            )
            session.add(note)
            marianne_notes[title] = note

        # Notes brouillon (PRIVATE)
        brouillon_note = Note(
            owner_id=marianne.id,
            collection_id=coll_brouillons.id,
            title="Draft - Programmation fonctionnelle",
            content=_doc(
                _heading(1, "TODO - Programmation fonctionnelle"),
                _paragraph(_text("Cours en préparation sur les concepts de programmation fonctionnelle en Python.")),
                _heading(2, "Plan prévu"),
                _bullet_list(
                    "Fonctions lambda",
                    "map, filter, reduce",
                    "Compréhensions de liste",
                    "Générateurs et itérateurs"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["brouillon", "fonctionnel"],
        )
        session.add(brouillon_note)
        marianne_notes["Draft - Programmation fonctionnelle"] = brouillon_note

        session.flush()
        print("Marianne's collections and notes inserted (13 notes).")

        # Liens entre notes de Marianne
        marianne_links = [
            ("Intro Programmation", "Variables et Types", "chapitre suivant"),
            ("Variables et Types", "Structures de contrôle", "chapitre suivant"),
            ("Structures de contrôle", "Boucles", "chapitre suivant"),
            ("Boucles", "Fonctions", "chapitre suivant"),
            ("Fonctions", "Listes et Dictionnaires", "chapitre suivant"),
            ("Listes et Dictionnaires", "Fichiers", "chapitre suivant"),
            ("Fichiers", "Exceptions", "chapitre suivant"),
            ("Exceptions", "POO Bases", "cours suivant"),
            ("POO Bases", "POO Héritage", "chapitre suivant"),
            ("POO Héritage", "Tests unitaires", "chapitre suivant"),
            ("Tests unitaires", "Bonnes pratiques", "chapitre suivant"),
            ("Fonctions", "POO Bases", "prérequis"),
        ]
        for src, tgt, label in marianne_links:
            if src in marianne_notes and tgt in marianne_notes:
                session.add(NoteLink(
                    note_id_1=marianne_notes[src].id,
                    note_id_2=marianne_notes[tgt].id,
                    label=label,
                ))
        print("Marianne's note links inserted (12 links).")

        # Partages de Marianne avec collègues (brouillons)
        session.add_all([
            CollectionShare(
                collection_id=coll_brouillons.id,
                user_id=pierre.id,
                permission=SharePermissionEnum.WRITE,
            ),
            CollectionShare(
                collection_id=coll_brouillons.id,
                user_id=claire.id,
                permission=SharePermissionEnum.READ,
            ),
        ])
        print("Marianne's colleague shares inserted (2 shares).")

        # Flashcards de Marianne
        for question, answers in MARIANNE_FLASHCARDS:
            note_id = marianne_notes["Intro Programmation"].id
            fc = Flashcard(note_id=note_id, question=question)
            session.add(fc)
            session.flush()
            for answer_text, is_correct in answers:
                session.add(FlashcardAnswer(
                    flashcard_id=fc.id,
                    answer_text=answer_text,
                    is_correct=is_correct,
                ))
        print("Marianne's flashcards inserted (10 flashcards).")

        # =====================================================================
        # NOTES ORPHELINES (sans collection) - pour démontrer le graphe
        # =====================================================================
        orphan_notes = {}

        # Notes orphelines de Sophie
        sophie_orphan_1 = Note(
            owner_id=sophie.id,
            collection_id=None,
            title="Idées recettes tisanes",
            content=_doc(
                _heading(1, "Mes recettes de tisanes maison"),
                _heading(2, "Tisane digestive"),
                _bullet_list(
                    "Menthe poivrée - 1 cuillère",
                    "Camomille - 1 cuillère",
                    "Fenouil - 1/2 cuillère",
                    "Infuser 10 min"
                ),
                _heading(2, "Tisane relaxante"),
                _bullet_list(
                    "Tilleul - 1 cuillère",
                    "Passiflore - 1 cuillère",
                    "Miel - 1 cuillère",
                    "Infuser 8 min"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["recettes", "tisanes", "personnel"],
        )
        session.add(sophie_orphan_1)
        orphan_notes["sophie_tisanes"] = sophie_orphan_1

        sophie_orphan_2 = Note(
            owner_id=sophie.id,
            collection_id=None,
            title="Notes consultation du 15/01",
            content=_doc(
                _heading(1, "Consultation - Mme Dupont"),
                _paragraph(_text("Symptômes : fatigue chronique, troubles du sommeil")),
                _heading(2, "Recommandations"),
                _bullet_list(
                    "Rhodiola rosea - 200mg matin",
                    "Valériane - soir avant coucher",
                    "Réduire café après 14h"
                ),
                _heading(2, "Suivi"),
                _paragraph(_text("RDV dans 3 semaines pour évaluation."))
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["consultation", "suivi", "patient"],
        )
        session.add(sophie_orphan_2)
        orphan_notes["sophie_consultation"] = sophie_orphan_2

        # Notes orphelines de Luc
        luc_orphan_1 = Note(
            owner_id=luc.id,
            collection_id=None,
            title="Idées side project",
            content=_doc(
                _heading(1, "Idées de projets personnels"),
                _heading(2, "App météo minimaliste"),
                _bullet_list(
                    "React Native",
                    "API OpenWeatherMap",
                    "Design épuré"
                ),
                _heading(2, "CLI pour notes"),
                _bullet_list(
                    "Rust ou Go",
                    "Markdown support",
                    "Sync avec Git"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["idées", "side-project", "perso"],
        )
        session.add(luc_orphan_1)
        orphan_notes["luc_idees"] = luc_orphan_1

        luc_orphan_2 = Note(
            owner_id=luc.id,
            collection_id=None,
            title="Liens utiles dev",
            content=_doc(
                _heading(1, "Ressources bookmarkées"),
                _heading(2, "Documentation"),
                _bullet_list(
                    "MDN Web Docs",
                    "React documentation",
                    "TypeScript handbook"
                ),
                _heading(2, "Outils"),
                _bullet_list(
                    "Excalidraw - diagrammes",
                    "Regex101 - test regex",
                    "JSON Formatter"
                ),
                _heading(2, "Blogs"),
                _bullet_list(
                    "Kent C. Dodds",
                    "Dan Abramov - Overreacted",
                    "Josh Comeau"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["liens", "ressources", "bookmarks"],
        )
        session.add(luc_orphan_2)
        orphan_notes["luc_liens"] = luc_orphan_2

        # Notes orphelines d'Andréas
        andreas_orphan_1 = Note(
            owner_id=andreas.id,
            collection_id=None,
            title="Planning révisions partiels",
            content=_doc(
                _heading(1, "Planning révisions - Semaine partiels"),
                _heading(2, "Lundi"),
                _bullet_list(
                    "Matin : Algo - Complexité et tris",
                    "Après-midi : SQL - Requêtes avancées"
                ),
                _heading(2, "Mardi"),
                _bullet_list(
                    "Matin : POO et Design Patterns",
                    "Après-midi : Exercices pratiques"
                ),
                _heading(2, "Mercredi"),
                _bullet_list(
                    "Matin : Révision rapide tous les sujets",
                    "Après-midi : PARTIEL"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["planning", "révisions", "examen"],
        )
        session.add(andreas_orphan_1)
        orphan_notes["andreas_planning"] = andreas_orphan_1

        andreas_orphan_2 = Note(
            owner_id=andreas.id,
            collection_id=None,
            title="Questions à poser au prof",
            content=_doc(
                _heading(1, "Questions en suspens"),
                _heading(2, "Algorithmique"),
                _bullet_list(
                    "Différence entre Dijkstra et A* ?",
                    "Quand utiliser DP vs greedy ?"
                ),
                _heading(2, "BDD"),
                _bullet_list(
                    "Index sur clé étrangère automatique ?",
                    "Performance CTE vs sous-requête ?"
                ),
                _heading(2, "Projet"),
                _bullet_list(
                    "Deadline rendu final ?",
                    "Format de présentation ?"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["questions", "cours", "à demander"],
        )
        session.add(andreas_orphan_2)
        orphan_notes["andreas_questions"] = andreas_orphan_2

        # Notes orphelines de Marianne
        marianne_orphan_1 = Note(
            owner_id=marianne.id,
            collection_id=None,
            title="Idées exercices TP",
            content=_doc(
                _heading(1, "Banque d'idées d'exercices"),
                _heading(2, "Niveau débutant"),
                _bullet_list(
                    "Calculatrice simple",
                    "Jeu du nombre mystère",
                    "Convertisseur de température"
                ),
                _heading(2, "Niveau intermédiaire"),
                _bullet_list(
                    "Gestionnaire de contacts",
                    "Mini jeu de pendu",
                    "Analyseur de texte (stats)"
                ),
                _heading(2, "Niveau avancé"),
                _bullet_list(
                    "API REST simple",
                    "Scraper basique",
                    "Chatbot CLI"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["exercices", "TP", "idées"],
        )
        session.add(marianne_orphan_1)
        orphan_notes["marianne_exercices"] = marianne_orphan_1

        marianne_orphan_2 = Note(
            owner_id=marianne.id,
            collection_id=None,
            title="Feedback étudiants S1",
            content=_doc(
                _heading(1, "Retours étudiants - Semestre 1"),
                _heading(2, "Points positifs"),
                _bullet_list(
                    "Cours clairs et structurés",
                    "Beaucoup d'exemples pratiques",
                    "Disponibilité pour questions"
                ),
                _heading(2, "À améliorer"),
                _bullet_list(
                    "Plus d'exercices corrigés",
                    "Vidéos de démonstration",
                    "TD en plus petits groupes"
                ),
                _heading(2, "Actions"),
                _bullet_list(
                    "Créer playlist YouTube",
                    "Ajouter corrections détaillées Moodle"
                )
            ),
            visibility=VisibilityEnum.PRIVATE,
            tags=["feedback", "étudiants", "amélioration"],
        )
        session.add(marianne_orphan_2)
        orphan_notes["marianne_feedback"] = marianne_orphan_2

        session.flush()
        print("Orphan notes inserted (8 notes).")

        # Liens entre notes orphelines et notes des collections
        orphan_links = [
            (sophie_orphan_1, sophie_notes["Menthe poivrée"], "utilise plante"),
            (sophie_orphan_1, sophie_notes["Camomille romaine"], "utilise plante"),
            (sophie_orphan_1, sophie_notes["Passiflore"], "utilise plante"),
            (sophie_orphan_2, sophie_notes["Gestion du sommeil"], "traitement"),
            (sophie_orphan_2, sophie_notes["Valériane"], "prescription"),

            (luc_orphan_1, luc_notes["Architecture projet"], "inspiration"),
            (luc_orphan_1, luc_notes["React Query - Cache"], "technologie"),
            (luc_orphan_2, luc_notes["Guide React hooks"], "documentation"),

            (andreas_orphan_1, andreas_notes["Algo - Complexité"], "à réviser"),
            (andreas_orphan_1, andreas_notes["SQL - Avancé"], "à réviser"),
            (andreas_orphan_1, andreas_notes["Design Patterns"], "à réviser"),
            (andreas_orphan_2, andreas_notes["Algo - Graphes"], "question"),
            (andreas_orphan_2, andreas_notes["Algo - Programmation dynamique"], "question"),

            (marianne_orphan_1, marianne_notes["Fonctions"], "exercice pour"),
            (marianne_orphan_1, marianne_notes["Listes et Dictionnaires"], "exercice pour"),
            (marianne_orphan_2, marianne_notes["Intro Programmation"], "concerne cours"),
        ]
        for src_note, tgt_note, label in orphan_links:
            session.add(NoteLink(
                note_id_1=src_note.id,
                note_id_2=tgt_note.id,
                label=label,
            ))
        print("Orphan notes links inserted (16 links).")

        # =====================================================================
        # FAVORIS
        # =====================================================================
        session.add_all([
            # Sophie met en favori ses notes clés
            NoteFavorite(user_id=sophie.id, note_id=sophie_notes["Phytothérapie - Introduction"].id),
            NoteFavorite(user_id=sophie.id, note_id=sophie_notes["Troubles digestifs - Approche"].id),
            CollectionFavorite(user_id=sophie.id, collection_id=coll_phyto.id),

            # Luc et son équipe
            CollectionFavorite(user_id=luc.id, collection_id=coll_projet.id),
            CollectionFavorite(user_id=emma.id, collection_id=coll_projet.id),
            NoteFavorite(user_id=thomas.id, note_id=luc_notes["Setup environnement"].id),

            # Andréas - révisions prioritaires
            NoteFavorite(user_id=andreas.id, note_id=andreas_notes["Algo - Complexité"].id),
            NoteFavorite(user_id=andreas.id, note_id=andreas_notes["SQL - Bases"].id),
            CollectionFavorite(user_id=andreas.id, collection_id=coll_algo.id),

            # Étudiants de Marianne
            CollectionFavorite(user_id=etudiant1.id, collection_id=coll_intro_prog.id),
            CollectionFavorite(user_id=etudiant2.id, collection_id=coll_intro_prog.id),
            CollectionFavorite(user_id=etudiant3.id, collection_id=coll_poo.id),
            NoteFavorite(user_id=etudiant1.id, note_id=marianne_notes["Fonctions"].id),
        ])
        print("Favorites inserted (13 favorites).")

        # =====================================================================
        # REPORTS (pour démontrer la modération)
        # =====================================================================
        session.add_all([
            Report(
                note_id=marianne_notes["Intro Programmation"].id,
                reporter_id=admin.id,
                reason=ReportReasonEnum.TECHNICAL_ISSUE,
                status=ReportStatusEnum.RESOLVED,
                description="Lien cassé dans le contenu - corrigé.",
            ),
        ])
        print("Reports inserted (1 report).")

        session.flush()
        print("\n" + "=" * 60)
        print("SEED COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\nComptes utilisateurs créés:")
        print("-" * 40)
        print("Admin:")
        print("  - superadmin@memora.fr / SuperAdmin123!")
        print("  - admin@memora.fr / AdminPass123!")
        print("\nScénario 1 - Sophie (Médecine naturelle):")
        print("  - sophie.martin@email.fr / SophiePass123!")
        print("\nScénario 2 - Luc (Projet étudiant):")
        print("  - luc.dupont@etudiant.fr / LucDupont123!")
        print("  - emma.bernard@etudiant.fr / EmmaBernard123!")
        print("  - thomas.petit@etudiant.fr / ThomasPetit123!")
        print("  - julie.moreau@etudiant.fr / JulieMoreau123!")
        print("\nScénario 3 - Andréas (Révisions):")
        print("  - andreas.schmidt@etudiant.fr / AndreasPass123!")
        print("\nScénario 4 - Marianne (Enseignante):")
        print("  - marianne.leroy@universite.fr / MariannePass123!")
        print("  - pierre.dubois@universite.fr / PierrePass123!")
        print("  - claire.rousseau@universite.fr / ClairePass123!")
        print("  - maxime.girard@etudiant.fr / MaximeGirard123!")
        print("  - lea.fontaine@etudiant.fr / LeaFontaine123!")
        print("  - hugo.lambert@etudiant.fr / HugoLambert123!")
        print("-" * 40)


if __name__ == "__main__":
    seed()

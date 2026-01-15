"""Seed script that resets the database and inserts sample data for demo scenarios.

Usage:
    python scripts/seed_db.py

Scenarios:
    1. Sophie - Médecine naturelle (apprentissage long terme, notes interconnectées)
    2. Luc - Projet étudiant (organisation équipe, partages)
    3. Andréas - Révisions rapides (flashcards, mobile)
    4. Marianne - Enseignante (brouillons, mutualisation collègues)
"""
import json
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


# =============================================================================
# HELPERS POUR CRÉER DU CONTENU JSON TIPTAP
# =============================================================================


def _text(content: str, bold: bool = False, italic: bool = False, code: bool = False) -> dict:
    """Crée un noeud texte Tiptap avec marks optionnels."""
    node = {"type": "text", "text": content}
    marks = []
    if bold:
        marks.append({"type": "bold"})
    if italic:
        marks.append({"type": "italic"})
    if code:
        marks.append({"type": "code"})
    if marks:
        node["marks"] = marks
    return node


def _paragraph(*children) -> dict:
    """Crée un paragraphe Tiptap."""
    if not children:
        return {"type": "paragraph"}
    return {"type": "paragraph", "content": list(children)}


def _heading(level: int, text: str) -> dict:
    """Crée un heading Tiptap (h1, h2, h3)."""
    return {
        "type": "heading",
        "attrs": {"level": level},
        "content": [_text(text)]
    }


def _bullet_list(*items) -> dict:
    """Crée une liste à puces Tiptap."""
    list_items = []
    for item in items:
        if isinstance(item, (list, tuple)):
            list_items.append({"type": "listItem", "content": [_paragraph(*item)]})
        else:
            list_items.append({"type": "listItem", "content": [_paragraph(_text(item))]})
    return {"type": "bulletList", "content": list_items}


def _ordered_list(*items) -> dict:
    """Crée une liste numérotée Tiptap."""
    list_items = []
    for item in items:
        if isinstance(item, (list, tuple)):
            list_items.append({"type": "listItem", "content": [_paragraph(*item)]})
        else:
            list_items.append({"type": "listItem", "content": [_paragraph(_text(item))]})
    return {"type": "orderedList", "attrs": {"start": 1}, "content": list_items}


def _code_block(code: str, language: str = "python") -> dict:
    """Crée un bloc de code Tiptap."""
    return {
        "type": "codeBlock",
        "attrs": {"language": language},
        "content": [_text(code)]
    }


def _doc(*children) -> str:
    """Crée un document Tiptap complet et le sérialise en JSON."""
    return json.dumps({"type": "doc", "content": list(children)}, ensure_ascii=False)


# =============================================================================
# CONTENU DES NOTES - SOPHIE (PHYTOTHÉRAPIE)
# =============================================================================

SOPHIE_NOTES_CONTENT = {
    "Phytothérapie - Introduction": _doc(
        _heading(1, "Introduction à la Phytothérapie"),
        _paragraph(_text("La phytothérapie est l'art de soigner par les plantes. Cette discipline ancestrale utilise les propriétés médicinales des végétaux pour prévenir et traiter diverses affections.")),
        _heading(2, "Principes fondamentaux"),
        _bullet_list(
            [_text("Totum", bold=True), _text(" : L'ensemble des constituants de la plante agit en synergie")],
            [_text("Terrain", bold=True), _text(" : Adaptation du traitement à chaque individu")],
            [_text("Prévention", bold=True), _text(" : Renforcer l'organisme avant la maladie")]
        ),
        _heading(2, "Formes galéniques principales"),
        _ordered_list(
            "Tisanes (infusions, décoctions)",
            "Teintures mères",
            "Extraits secs standardisés",
            "Huiles essentielles",
            "Gélules et comprimés"
        ),
        _heading(2, "Précautions importantes"),
        _paragraph(_text("Naturel ne signifie pas sans danger. Certaines plantes peuvent être toxiques ou interagir avec des médicaments."))
    ),

    "Camomille romaine": _doc(
        _heading(1, "Camomille romaine (Chamaemelum nobile)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Asteraceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Capitules floraux")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Huile essentielle (chamazulène, bisabolol)",
            "Flavonoïdes (apigénine)",
            "Lactones sesquiterpéniques"
        ),
        _heading(2, "Propriétés thérapeutiques"),
        _bullet_list(
            [_text("Digestive", bold=True), _text(" : Antispasmodique, carminative")],
            [_text("Nerveuse", bold=True), _text(" : Sédative légère, anxiolytique")],
            [_text("Anti-inflammatoire", bold=True), _text(" : Usage externe (peau, yeux)")]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Troubles digestifs fonctionnels",
            "Nervosité, troubles du sommeil",
            "Inflammations cutanées"
        ),
        _heading(2, "Posologie"),
        _paragraph(_text("Infusion", bold=True), _text(" : 5-10g de fleurs séchées pour 1L d'eau, 2-3 tasses/jour"))
    ),

    "Lavande officinale": _doc(
        _heading(1, "Lavande officinale (Lavandula angustifolia)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Lamiaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Sommités fleuries")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Huile essentielle (linalol, acétate de linalyle)",
            "Tanins",
            "Coumarines"
        ),
        _heading(2, "Propriétés thérapeutiques"),
        _bullet_list(
            [_text("Système nerveux", bold=True), _text(" : Anxiolytique, sédative")],
            [_text("Antiseptique", bold=True), _text(" : Antibactérienne, antifongique")],
            [_text("Cicatrisante", bold=True), _text(" : Brûlures, plaies")]
        ),
        _heading(2, "Modes d'utilisation"),
        _ordered_list(
            [_text("Infusion", bold=True), _text(" : 20g/L, 3 tasses/jour")],
            [_text("HE en diffusion", bold=True), _text(" : Relaxation atmosphérique")],
            [_text("HE locale", bold=True), _text(" : 2 gouttes sur les tempes (migraines)")]
        )
    ),

    "Valériane": _doc(
        _heading(1, "Valériane (Valeriana officinalis)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Caprifoliaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Racines et rhizomes")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Acide valérénique",
            "Valépotriates",
            "GABA",
            "Huile essentielle"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Sédative", bold=True), _text(" : Action sur les récepteurs GABA")],
            [_text("Anxiolytique", bold=True), _text(" : Réduction du stress")],
            [_text("Myorelaxante", bold=True), _text(" : Décontraction musculaire")]
        ),
        _heading(2, "Indications principales"),
        _bullet_list(
            "Insomnie d'endormissement",
            "Anxiété, nervosité",
            "Sevrage des benzodiazépines (accompagnement)"
        ),
        _heading(2, "Précautions"),
        _paragraph(_text("Ne pas associer avec alcool ou autres sédatifs. Effet progressif (2-4 semaines)."))
    ),

    "Troubles digestifs - Approche": _doc(
        _heading(1, "Approche phytothérapeutique des troubles digestifs"),
        _heading(2, "Étiologies fréquentes"),
        _bullet_list(
            "Stress et émotions",
            "Alimentation inadaptée",
            "Dysbiose intestinale",
            "Insuffisance hépatobiliaire"
        ),
        _heading(2, "Stratégie thérapeutique"),
        _heading(3, "1. Soutien hépatique"),
        _paragraph(_text("Artichaut, chardon-marie, romarin")),
        _heading(3, "2. Stimulation digestive"),
        _paragraph(_text("Gentiane, fenouil, menthe poivrée")),
        _heading(3, "3. Apaisement"),
        _paragraph(_text("Camomille, mélisse, réglisse")),
        _heading(2, "Protocole type - Dyspepsie"),
        _ordered_list(
            "Avant repas : EPS gentiane (5ml)",
            "Après repas : Tisane digestive (menthe + fenouil)",
            "Cure de fond : Chardon-marie 3 semaines"
        )
    ),

    "Stress et anxiété": _doc(
        _heading(1, "Phytothérapie du stress et de l'anxiété"),
        _heading(2, "Mécanismes en jeu"),
        _paragraph(_text("Le stress chronique perturbe l'axe hypothalamo-hypophyso-surrénalien (HHS) et épuise les réserves de neurotransmetteurs.")),
        _heading(2, "Plantes adaptogènes"),
        _bullet_list(
            [_text("Rhodiola rosea", bold=True), _text(" : Fatigue, stress")],
            [_text("Ashwagandha", bold=True), _text(" : Anxiété, sommeil")],
            [_text("Éleuthérocoque", bold=True), _text(" : Fatigue intellectuelle")]
        ),
        _heading(2, "Plantes anxiolytiques"),
        _bullet_list(
            [_text("Passiflore", bold=True), _text(" : Anxiété avec composante somatique")],
            [_text("Valériane", bold=True), _text(" : Tension nerveuse, insomnie")],
            [_text("Aubépine", bold=True), _text(" : Anxiété avec palpitations")]
        ),
        _heading(2, "Synergie recommandée"),
        _paragraph(_text("Association passiflore + aubépine + valériane en EPS ou gélules."))
    ),

    "Millepertuis": _doc(
        _heading(1, "Millepertuis (Hypericum perforatum)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Hypericaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Sommités fleuries")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Hypéricine (naphthodianthrone)",
            "Hyperforine",
            "Flavonoïdes"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Antidépresseur", bold=True), _text(" : Inhibition recapture sérotonine/noradrénaline")],
            [_text("Anxiolytique", bold=True)],
            [_text("Antiviral", bold=True), _text(" (usage externe)")]
        ),
        _heading(2, "⚠️ INTERACTIONS MAJEURES"),
        _paragraph(_text("Le millepertuis est un ", italic=False), _text("inducteur enzymatique puissant", bold=True), _text(" (CYP3A4). Il diminue l'efficacité de nombreux médicaments :")),
        _bullet_list(
            "Contraceptifs oraux",
            "Anticoagulants",
            "Immunosuppresseurs",
            "Antirétroviraux"
        )
    ),

    "Échinacée - Immunité": _doc(
        _heading(1, "Échinacée (Echinacea purpurea)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Asteraceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Racines, parties aériennes")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Alkylamides",
            "Polysaccharides immunostimulants",
            "Acide cichorique"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Immunostimulante", bold=True), _text(" : Activation des macrophages")],
            [_text("Anti-infectieuse", bold=True), _text(" : Voies respiratoires")],
            [_text("Anti-inflammatoire", bold=True)]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Prévention des infections hivernales",
            "Traitement précoce du rhume",
            "Infections urinaires récidivantes"
        ),
        _heading(2, "Posologie"),
        _paragraph(_text("Cure de 10 jours maximum, pause de 3 semaines. Ne pas utiliser en continu."))
    ),

    "Aromathérapie - Bases": _doc(
        _heading(1, "Bases de l'aromathérapie"),
        _heading(2, "Définition"),
        _paragraph(_text("L'aromathérapie utilise les huiles essentielles (HE) extraites de plantes aromatiques à des fins thérapeutiques.")),
        _heading(2, "Modes d'extraction"),
        _bullet_list(
            [_text("Distillation", bold=True), _text(" : Vapeur d'eau (la plus courante)")],
            [_text("Expression", bold=True), _text(" : Agrumes (zestes)")],
            [_text("Extraction CO2", bold=True), _text(" : Supercritique")]
        ),
        _heading(2, "Voies d'administration"),
        _ordered_list(
            [_text("Cutanée", bold=True), _text(" : Diluée dans huile végétale")],
            [_text("Olfactive", bold=True), _text(" : Diffusion, inhalation")],
            [_text("Orale", bold=True), _text(" : Sur support, avec précaution")]
        ),
        _heading(2, "Règles de sécurité"),
        _bullet_list(
            "Jamais pure sur la peau (sauf exceptions)",
            "Test cutané préalable",
            "Contre-indiquées grossesse/enfants (sauf avis)",
            "Conservation à l'abri de la lumière"
        )
    ),

    "Tea tree - Antiseptique": _doc(
        _heading(1, "Tea tree (Melaleuca alternifolia)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Myrtaceae")),
        _paragraph(_text("Origine", bold=True), _text(" : Australie")),
        _heading(2, "Composition"),
        _bullet_list(
            "Terpinène-4-ol (30-40%)",
            "Gamma-terpinène",
            "Alpha-terpinène"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Antibactérien", bold=True), _text(" : Large spectre")],
            [_text("Antifongique", bold=True), _text(" : Candida, dermatophytes")],
            [_text("Antiviral", bold=True)],
            [_text("Immunostimulant", bold=True)]
        ),
        _heading(2, "Applications pratiques"),
        _bullet_list(
            "Acné : 1 goutte locale",
            "Mycoses : Diluée à 10% dans huile végétale",
            "Infections ORL : Inhalation",
            "Assainissement : Diffusion atmosphérique"
        )
    ),

    "Pathologies hivernales": _doc(
        _heading(1, "Prévention et traitement des pathologies hivernales"),
        _heading(2, "Stratégie préventive"),
        _heading(3, "Renforcement immunitaire (octobre-novembre)"),
        _bullet_list(
            "Échinacée : Cure de 3 semaines",
            "Vitamine D : Supplémentation",
            "Propolis : Spray gorge quotidien"
        ),
        _heading(2, "En cas d'infection"),
        _heading(3, "Début de rhume"),
        _bullet_list(
            "HE Ravintsara : 2 gouttes sur poignets, 3x/jour",
            "Tisane thym-citron-miel",
            "Échinacée : Dose d'attaque"
        ),
        _heading(3, "Toux grasse"),
        _bullet_list(
            "Thym : Expectorant",
            "Lierre grimpant : Bronchodilatateur",
            "Eucalyptus globulus : Mucolytique"
        ),
        _heading(3, "Toux sèche"),
        _bullet_list(
            "Mauve : Émolliente",
            "Guimauve : Adoucissante",
            "Miel de thym"
        )
    ),

    "Gestion du sommeil": _doc(
        _heading(1, "Phytothérapie des troubles du sommeil"),
        _heading(2, "Types d'insomnie"),
        _bullet_list(
            [_text("Endormissement", bold=True), _text(" : Difficulté à s'endormir")],
            [_text("Maintien", bold=True), _text(" : Réveils nocturnes")],
            [_text("Terminal", bold=True), _text(" : Réveil précoce")]
        ),
        _heading(2, "Plantes sédatives"),
        _bullet_list(
            [_text("Valériane", bold=True), _text(" → Endormissement")],
            [_text("Passiflore", bold=True), _text(" → Réveils anxieux")],
            [_text("Houblon", bold=True), _text(" → Agitation")],
            [_text("Eschscholtzia", bold=True), _text(" → Sommeil profond")]
        ),
        _heading(2, "Protocole type"),
        _ordered_list(
            "18h : Tisane mélisse-tilleul",
            "20h : Dîner léger, pas d'écrans",
            "21h : EPS passiflore-valériane (5ml)",
            "22h : HE lavande sur oreiller"
        )
    ),

    "Douleurs articulaires": _doc(
        _heading(1, "Approche des douleurs articulaires"),
        _heading(2, "Étiologies"),
        _bullet_list(
            "Arthrose (dégénératif)",
            "Arthrite (inflammatoire)",
            "Traumatique"
        ),
        _heading(2, "Plantes anti-inflammatoires"),
        _bullet_list(
            [_text("Harpagophytum", bold=True), _text(" : Arthrose, tendinite")],
            [_text("Curcuma", bold=True), _text(" : Anti-inflammatoire général")],
            [_text("Reine-des-prés", bold=True), _text(" : Salicylés naturels")],
            [_text("Saule blanc", bold=True), _text(" : Douleurs aiguës")]
        ),
        _heading(2, "Usage externe"),
        _bullet_list(
            "HE Gaulthérie : Massage (diluée)",
            "HE Eucalyptus citronné : Anti-inflammatoire",
            "Arnica : Traumatismes"
        ),
        _heading(2, "Compléments"),
        _bullet_list(
            "Glucosamine-chondroïtine",
            "Collagène type II",
            "Silicium organique"
        )
    ),

    "Détox hépatique": _doc(
        _heading(1, "Cure détox hépatique"),
        _heading(2, "Indications"),
        _bullet_list(
            "Fatigue chronique",
            "Digestion lourde",
            "Teint brouillé",
            "Changement de saison"
        ),
        _heading(2, "Plantes hépatoprotectrices"),
        _bullet_list(
            [_text("Chardon-marie", bold=True), _text(" : Silymarine, régénération hépatocytes")],
            [_text("Desmodium", bold=True), _text(" : Protection, régénération")],
            [_text("Artichaut", bold=True), _text(" : Cholagogue, cholérétique")],
            [_text("Radis noir", bold=True), _text(" : Drainage biliaire")]
        ),
        _heading(2, "Protocole 3 semaines"),
        _ordered_list(
            [_text("Semaine 1", bold=True), _text(" : Artichaut + radis noir (drainage)")],
            [_text("Semaine 2", bold=True), _text(" : Chardon-marie (protection)")],
            [_text("Semaine 3", bold=True), _text(" : Desmodium (régénération)")]
        ),
        _heading(2, "Accompagnement"),
        _bullet_list(
            "Hydratation ++ (2L/jour)",
            "Alimentation légère",
            "Éviter alcool et graisses"
        )
    ),

    "Circulation veineuse": _doc(
        _heading(1, "Insuffisance veineuse - Approche naturelle"),
        _heading(2, "Symptômes"),
        _bullet_list(
            "Jambes lourdes",
            "Œdèmes",
            "Varices",
            "Impatiences"
        ),
        _heading(2, "Plantes veinotoniques"),
        _bullet_list(
            [_text("Vigne rouge", bold=True), _text(" : Anthocyanes, protection vasculaire")],
            [_text("Marronnier d'Inde", bold=True), _text(" : Escine, anti-œdémateux")],
            [_text("Hamamélis", bold=True), _text(" : Astringent veineux")],
            [_text("Petit houx", bold=True), _text(" : Ruscogénines")]
        ),
        _heading(2, "Usage externe"),
        _bullet_list(
            "HE Cyprès : Massage ascendant",
            "HE Lentisque pistachier : Décongestionnant",
            "Gel jambes légères (vigne rouge + menthol)"
        ),
        _heading(2, "Hygiène de vie"),
        _bullet_list(
            "Surélever les jambes",
            "Éviter chaleur et station debout prolongée",
            "Bas de contention si nécessaire"
        )
    ),
}

# =============================================================================
# CONTENU DES NOTES - LUC (PROJET ÉTUDIANT)
# =============================================================================

LUC_NOTES_CONTENT = {
    "Architecture projet": _doc(
        _heading(1, "Architecture du projet - Application de gestion de tâches"),
        _heading(2, "Stack technique"),
        _bullet_list(
            [_text("Frontend", bold=True), _text(" : React + TypeScript + Vite")],
            [_text("Backend", bold=True), _text(" : Node.js + Express + Prisma")],
            [_text("Base de données", bold=True), _text(" : PostgreSQL")],
            [_text("Auth", bold=True), _text(" : JWT + Refresh tokens")]
        ),
        _heading(2, "Structure des dossiers"),
        _code_block("""project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── middleware/""", "text"),
        _heading(2, "Conventions"),
        _bullet_list(
            "Commits : Conventional Commits",
            "Branches : feature/, bugfix/, hotfix/",
            "PRs : Review obligatoire par 1 membre"
        )
    ),

    "API REST - Endpoints": _doc(
        _heading(1, "Documentation API REST"),
        _heading(2, "Base URL"),
        _paragraph(_text("https://api.projet.com/v1", code=True)),
        _heading(2, "Authentification"),
        _code_block("""POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout""", "text"),
        _heading(2, "Tâches"),
        _code_block("""GET    /tasks          # Liste des tâches
POST   /tasks          # Créer une tâche
GET    /tasks/:id      # Détail d'une tâche
PUT    /tasks/:id      # Modifier une tâche
DELETE /tasks/:id      # Supprimer une tâche
PATCH  /tasks/:id/status  # Changer le statut""", "text"),
        _heading(2, "Projets"),
        _code_block("""GET    /projects
POST   /projects
GET    /projects/:id
PUT    /projects/:id
DELETE /projects/:id
GET    /projects/:id/tasks""", "text"),
        _heading(2, "Codes de retour"),
        _bullet_list(
            "200 : Succès",
            "201 : Créé",
            "400 : Erreur de validation",
            "401 : Non authentifié",
            "403 : Non autorisé",
            "404 : Non trouvé"
        )
    ),

    "Modèle de données": _doc(
        _heading(1, "Modèle de données"),
        _heading(2, "User"),
        _code_block("""model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  avatar    String?
  role      Role     @default(MEMBER)
  tasks     Task[]
  projects  ProjectMember[]
  createdAt DateTime @default(now())
}""", "prisma"),
        _heading(2, "Project"),
        _code_block("""model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime @default(now())
}""", "prisma"),
        _heading(2, "Task"),
        _code_block("""model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  assignee    User?    @relation(fields: [assigneeId])
  assigneeId  String?
  project     Project  @relation(fields: [projectId])
  projectId   String
  createdAt   DateTime @default(now())
}""", "prisma")
    ),

    "Guide React hooks": _doc(
        _heading(1, "Guide des hooks React du projet"),
        _heading(2, "useAuth"),
        _code_block("""const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Logout
logout();

// Vérifier l'auth
if (isAuthenticated) { ... }""", "typescript"),
        _heading(2, "useTasks"),
        _code_block("""const {
  tasks,
  isLoading,
  createTask,
  updateTask,
  deleteTask
} = useTasks(projectId);

// Créer une tâche
await createTask({ title, description, priority });

// Mettre à jour
await updateTask(taskId, { status: 'DONE' });""", "typescript"),
        _heading(2, "useProjects"),
        _code_block("""const { projects, createProject } = useProjects();

// Créer un projet
await createProject({ name, description });""", "typescript"),
        _heading(2, "Conventions"),
        _bullet_list(
            [_text("Tous les hooks sont dans ", italic=False), _text("src/hooks/", code=True)],
            "Un hook par fonctionnalité",
            "Utiliser React Query pour le cache"
        )
    ),

    "Réunion Sprint 1": _doc(
        _heading(1, "Compte-rendu Sprint 1"),
        _heading(2, "Participants"),
        _bullet_list(
            "Luc (Frontend)",
            "Emma (Backend)",
            "Thomas (Full-stack)",
            "Julie (Design)"
        ),
        _heading(2, "Réalisations"),
        _bullet_list(
            "✅ Setup projet frontend/backend",
            "✅ Authentification JWT",
            "✅ CRUD tâches basique",
            "✅ Maquettes validées"
        ),
        _heading(2, "En cours"),
        _bullet_list(
            "🔄 Interface liste de tâches",
            "🔄 Drag & drop Kanban"
        ),
        _heading(2, "Bloqueurs"),
        _bullet_list(
            "⚠️ Problème CORS en dev (Thomas)",
            "⚠️ Design système incomplet"
        ),
        _heading(2, "Actions Sprint 2"),
        _ordered_list(
            "Finir le Kanban",
            "Ajouter les projets",
            "Notifications temps réel"
        )
    ),

    "Réunion Sprint 2": _doc(
        _heading(1, "Compte-rendu Sprint 2"),
        _heading(2, "Review Sprint 1"),
        _paragraph(_text("Vélocité : 34 points / 40 prévus (85%)")),
        _heading(2, "Réalisations"),
        _bullet_list(
            "✅ Kanban drag & drop",
            "✅ Gestion des projets",
            "✅ Assignation des tâches",
            "✅ Filtres et recherche"
        ),
        _heading(2, "Démonstration"),
        _paragraph(_text("Démo réussie devant le prof. Feedback positif sur l'UX.")),
        _heading(2, "Retro"),
        _heading(3, "Ce qui a bien marché"),
        _bullet_list(
            "Communication quotidienne",
            "Code reviews rapides"
        ),
        _heading(3, "À améliorer"),
        _bullet_list(
            "Tests unitaires insuffisants",
            "Documentation à jour"
        ),
        _heading(2, "Sprint 3 - Objectifs"),
        _ordered_list(
            "Notifications WebSocket",
            "Dashboard statistiques",
            "Export PDF"
        )
    ),

    "Setup environnement": _doc(
        _heading(1, "Guide de setup environnement"),
        _heading(2, "Prérequis"),
        _bullet_list(
            "Node.js 18+",
            "pnpm 8+",
            "PostgreSQL 14+",
            "Redis (optionnel, pour les sessions)"
        ),
        _heading(2, "Installation"),
        _code_block("""# Cloner le repo
git clone git@github.com:equipe/projet.git
cd projet

# Backend
cd backend
cp .env.example .env
pnpm install
pnpm prisma migrate dev
pnpm dev

# Frontend (nouveau terminal)
cd frontend
cp .env.example .env
pnpm install
pnpm dev""", "bash"),
        _heading(2, "Variables d'environnement"),
        _heading(3, "Backend (.env)"),
        _code_block("""DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret""", "text"),
        _heading(3, "Frontend (.env)"),
        _code_block("""VITE_API_URL=http://localhost:3000""", "text"),
        _heading(2, "Ports"),
        _bullet_list(
            "Frontend : 5173",
            "Backend : 3000",
            "PostgreSQL : 5432"
        )
    ),

    "Tests - Guide": _doc(
        _heading(1, "Guide des tests"),
        _heading(2, "Structure"),
        _code_block("""tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
└── e2e/           # Tests end-to-end""", "text"),
        _heading(2, "Lancer les tests"),
        _code_block("""# Tous les tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E
pnpm test:e2e""", "bash"),
        _heading(2, "Conventions"),
        _bullet_list(
            [_text("Fichier test : ", italic=False), _text("*.test.ts", code=True), _text(" ou "), _text("*.spec.ts", code=True)],
            "Un describe par fonctionnalité",
            "Nommage : \"should [action] when [condition]\""
        ),
        _heading(2, "Exemple"),
        _code_block("""describe('TaskService', () => {
  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const task = await taskService.create({
        title: 'Test',
        projectId: 'xxx'
      });
      expect(task.id).toBeDefined();
    });

    it('should throw when title is empty', async () => {
      await expect(
        taskService.create({ title: '', projectId: 'xxx' })
      ).rejects.toThrow('Title required');
    });
  });
});""", "typescript")
    ),

    "Déploiement CI/CD": _doc(
        _heading(1, "Pipeline CI/CD"),
        _heading(2, "GitHub Actions"),
        _paragraph(_text("Fichier : "), _text(".github/workflows/ci.yml", code=True)),
        _heading(2, "Étapes"),
        _ordered_list(
            [_text("Lint", bold=True), _text(" : ESLint + Prettier")],
            [_text("Test", bold=True), _text(" : Unit + Integration")],
            [_text("Build", bold=True), _text(" : Frontend + Backend")],
            [_text("Deploy", bold=True), _text(" : Sur merge main")]
        ),
        _heading(2, "Environnements"),
        _bullet_list(
            [_text("Preview", bold=True), _text(" : Chaque PR (Vercel)")],
            [_text("Staging", bold=True), _text(" : Branch develop")],
            [_text("Production", bold=True), _text(" : Branch main")]
        ),
        _heading(2, "Secrets GitHub"),
        _code_block("""DATABASE_URL
JWT_SECRET
VERCEL_TOKEN""", "text"),
        _heading(2, "Déploiement manuel"),
        _code_block("""# Build production
pnpm build

# Deploy (si besoin)
pnpm deploy:prod""", "bash")
    ),

    "Design System": _doc(
        _heading(1, "Design System du projet"),
        _heading(2, "Couleurs"),
        _code_block("""--primary: #3B82F6;      /* Blue 500 */
--primary-dark: #2563EB; /* Blue 600 */
--success: #10B981;      /* Green 500 */
--warning: #F59E0B;      /* Amber 500 */
--error: #EF4444;        /* Red 500 */
--gray-50: #F9FAFB;
--gray-900: #111827;""", "css"),
        _heading(2, "Typography"),
        _bullet_list(
            "Font : Inter",
            "Headings : 600-700 weight",
            "Body : 400 weight"
        ),
        _heading(2, "Spacing"),
        _paragraph(_text("Base : 4px (Tailwind scale)")),
        _bullet_list(
            "xs: 4px",
            "sm: 8px",
            "md: 16px",
            "lg: 24px",
            "xl: 32px"
        ),
        _heading(2, "Composants"),
        _bullet_list(
            "Button : Primary, Secondary, Ghost",
            "Input : Text, Select, Checkbox",
            "Card : Default, Elevated",
            "Modal : Standard, Fullscreen"
        )
    ),
}

# =============================================================================
# CONTENU DES NOTES - ANDRÉAS (RÉVISIONS)
# =============================================================================

ANDREAS_NOTES_CONTENT = {
    "Algo - Complexité": _doc(
        _heading(1, "Complexité algorithmique"),
        _heading(2, "Notations"),
        _bullet_list(
            [_text("O(1)", bold=True), _text(" : Constant - accès tableau")],
            [_text("O(log n)", bold=True), _text(" : Logarithmique - recherche binaire")],
            [_text("O(n)", bold=True), _text(" : Linéaire - parcours liste")],
            [_text("O(n log n)", bold=True), _text(" : Quasi-linéaire - tri fusion")],
            [_text("O(n²)", bold=True), _text(" : Quadratique - tri bulle")],
            [_text("O(2^n)", bold=True), _text(" : Exponentiel - Fibonacci naïf")]
        ),
        _heading(2, "Exemples courants"),
        _bullet_list(
            "Array access → O(1)",
            "Array search → O(n)",
            "Binary search → O(log n)",
            "HashMap get/set → O(1) moyen",
            "QuickSort → O(n log n) moyen"
        )
    ),

    "Algo - Tri": _doc(
        _heading(1, "Algorithmes de tri"),
        _heading(2, "Tri par sélection"),
        _paragraph(_text("Complexité : O(n²)")),
        _code_block("""for i in range(n):
    min_idx = i
    for j in range(i+1, n):
        if arr[j] < arr[min_idx]:
            min_idx = j
    arr[i], arr[min_idx] = arr[min_idx], arr[i]""", "python"),
        _heading(2, "Tri rapide (QuickSort)"),
        _paragraph(_text("Complexité : O(n log n) moyen, O(n²) pire cas")),
        _code_block("""def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr)//2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)""", "python"),
        _heading(2, "Tri fusion (MergeSort)"),
        _paragraph(_text("Complexité : O(n log n) garanti")),
        _paragraph(_text("Stable, mais O(n) espace supplémentaire."))
    ),

    "Algo - Graphes": _doc(
        _heading(1, "Algorithmes sur les graphes"),
        _heading(2, "Représentations"),
        _bullet_list(
            [_text("Matrice d'adjacence", bold=True), _text(" : O(V²) espace")],
            [_text("Liste d'adjacence", bold=True), _text(" : O(V + E) espace")]
        ),
        _heading(2, "BFS - Parcours en largeur"),
        _paragraph(_text("Complexité : O(V + E)")),
        _code_block("""def bfs(graph, start):
    visited = set([start])
    queue = [start]
    while queue:
        node = queue.pop(0)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)""", "python"),
        _heading(2, "DFS - Parcours en profondeur"),
        _paragraph(_text("Complexité : O(V + E)")),
        _code_block("""def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)""", "python"),
        _heading(2, "Dijkstra"),
        _paragraph(_text("Plus court chemin, poids positifs : O((V + E) log V)"))
    ),

    "SQL - Bases": _doc(
        _heading(1, "SQL - Requêtes essentielles"),
        _heading(2, "SELECT"),
        _code_block("""-- Sélection simple
SELECT * FROM users WHERE age > 18;

-- Colonnes spécifiques
SELECT name, email FROM users;

-- Alias
SELECT name AS nom, age AS age FROM users;""", "sql"),
        _heading(2, "JOIN"),
        _code_block("""-- INNER JOIN
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN (tous les users même sans commande)
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;""", "sql"),
        _heading(2, "Agrégation"),
        _code_block("""SELECT COUNT(*) FROM users;
SELECT AVG(age) FROM users;
SELECT department, COUNT(*)
FROM users
GROUP BY department
HAVING COUNT(*) > 5;""", "sql")
    ),

    "SQL - Avancé": _doc(
        _heading(1, "SQL Avancé"),
        _heading(2, "Sous-requêtes"),
        _code_block("""-- Dans WHERE
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 100);

-- Dans FROM
SELECT avg_total FROM (
    SELECT user_id, AVG(total) as avg_total
    FROM orders GROUP BY user_id
) subquery;""", "sql"),
        _heading(2, "CTE (Common Table Expression)"),
        _code_block("""WITH high_spenders AS (
    SELECT user_id, SUM(total) as total_spent
    FROM orders
    GROUP BY user_id
    HAVING SUM(total) > 1000
)
SELECT u.name, hs.total_spent
FROM users u
JOIN high_spenders hs ON u.id = hs.user_id;""", "sql"),
        _heading(2, "Window Functions"),
        _code_block("""SELECT name, salary,
    RANK() OVER (ORDER BY salary DESC) as rank,
    AVG(salary) OVER () as avg_salary
FROM employees;""", "sql"),
        _heading(2, "Index"),
        _code_block("""CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);""", "sql")
    ),

    "POO - Principes": _doc(
        _heading(1, "Programmation Orientée Objet"),
        _heading(2, "4 Piliers"),
        _ordered_list(
            [_text("Encapsulation", bold=True), _text(" : Cacher l'implémentation")],
            [_text("Abstraction", bold=True), _text(" : Simplifier la complexité")],
            [_text("Héritage", bold=True), _text(" : Réutiliser du code")],
            [_text("Polymorphisme", bold=True), _text(" : Même interface, comportements différents")]
        ),
        _heading(2, "SOLID"),
        _bullet_list(
            [_text("S", bold=True), _text("ingle Responsibility : Une classe = une responsabilité")],
            [_text("O", bold=True), _text("pen/Closed : Ouvert à l'extension, fermé à la modification")],
            [_text("L", bold=True), _text("iskov Substitution : Sous-classe substituable à parent")],
            [_text("I", bold=True), _text("nterface Segregation : Interfaces spécifiques > générales")],
            [_text("D", bold=True), _text("ependency Inversion : Dépendre des abstractions")]
        ),
        _heading(2, "Exemple Python"),
        _code_block("""class Animal:
    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!\"""", "python")
    ),

    "Design Patterns": _doc(
        _heading(1, "Design Patterns essentiels"),
        _heading(2, "Créationnels"),
        _bullet_list(
            [_text("Singleton", bold=True), _text(" : Instance unique")],
            [_text("Factory", bold=True), _text(" : Création déléguée")],
            [_text("Builder", bold=True), _text(" : Construction étape par étape")]
        ),
        _heading(2, "Structurels"),
        _bullet_list(
            [_text("Adapter", bold=True), _text(" : Compatibilité interfaces")],
            [_text("Decorator", bold=True), _text(" : Ajout comportements")],
            [_text("Facade", bold=True), _text(" : Interface simplifiée")]
        ),
        _heading(2, "Comportementaux"),
        _bullet_list(
            [_text("Observer", bold=True), _text(" : Notification changements")],
            [_text("Strategy", bold=True), _text(" : Algorithmes interchangeables")],
            [_text("State", bold=True), _text(" : Comportement selon état")]
        ),
        _heading(2, "Exemple Observer"),
        _code_block("""class Subject:
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        self._observers.append(observer)

    def notify(self, data):
        for obs in self._observers:
            obs.update(data)""", "python")
    ),

    "Git - Commandes": _doc(
        _heading(1, "Git - Commandes essentielles"),
        _heading(2, "Basics"),
        _code_block("""git init                    # Initialiser repo
git clone <url>            # Cloner
git status                  # État actuel
git add .                   # Tout ajouter
git commit -m "message"     # Commiter""", "bash"),
        _heading(2, "Branches"),
        _code_block("""git branch                  # Lister
git branch feature          # Créer
git checkout feature        # Basculer
git checkout -b feature     # Créer + basculer
git merge feature           # Fusionner
git branch -d feature       # Supprimer""", "bash"),
        _heading(2, "Remote"),
        _code_block("""git remote -v               # Voir remotes
git fetch                   # Récupérer sans merger
git pull                    # Fetch + merge
git push origin main        # Pousser""", "bash"),
        _heading(2, "Annuler"),
        _code_block("""git checkout -- file        # Annuler modifs fichier
git reset HEAD~1            # Annuler dernier commit (garder modifs)
git reset --hard HEAD~1     # Annuler commit + modifs
git revert <commit>         # Créer commit inverse""", "bash")
    ),

    "HTTP - Protocole": _doc(
        _heading(1, "Protocole HTTP"),
        _heading(2, "Méthodes"),
        _bullet_list(
            [_text("GET", bold=True), _text(" : Récupérer ressource")],
            [_text("POST", bold=True), _text(" : Créer ressource")],
            [_text("PUT", bold=True), _text(" : Remplacer ressource")],
            [_text("PATCH", bold=True), _text(" : Modifier partiellement")],
            [_text("DELETE", bold=True), _text(" : Supprimer")]
        ),
        _heading(2, "Codes de statut"),
        _bullet_list(
            [_text("2xx", bold=True), _text(" : Succès (200 OK, 201 Created, 204 No Content)")],
            [_text("3xx", bold=True), _text(" : Redirection (301, 302, 304)")],
            [_text("4xx", bold=True), _text(" : Erreur client (400, 401, 403, 404)")],
            [_text("5xx", bold=True), _text(" : Erreur serveur (500, 502, 503)")]
        ),
        _heading(2, "Headers courants"),
        _code_block("""Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
Cache-Control: no-cache""", "text"),
        _heading(2, "REST"),
        _bullet_list(
            "Sans état (stateless)",
            "Ressources identifiées par URL",
            "Opérations via méthodes HTTP"
        )
    ),

    "React - Hooks": _doc(
        _heading(1, "React Hooks"),
        _heading(2, "useState"),
        _code_block("""const [count, setCount] = useState(0);
setCount(count + 1);
setCount(prev => prev + 1);""", "typescript"),
        _heading(2, "useEffect"),
        _code_block("""// Au mount
useEffect(() => {
    fetchData();
}, []);

// Quand dep change
useEffect(() => {
    console.log(id);
}, [id]);

// Cleanup
useEffect(() => {
    const sub = subscribe();
    return () => sub.unsubscribe();
}, []);""", "typescript"),
        _heading(2, "useContext"),
        _code_block("""const ThemeContext = createContext('light');
const theme = useContext(ThemeContext);""", "typescript"),
        _heading(2, "useMemo / useCallback"),
        _code_block("""const memoized = useMemo(() => expensive(a, b), [a, b]);
const callback = useCallback(() => doSomething(a), [a]);""", "typescript"),
        _heading(2, "Custom Hook"),
        _code_block("""function useLocalStorage(key, initial) {
    const [value, setValue] = useState(
        () => JSON.parse(localStorage.getItem(key)) || initial
    );
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}""", "typescript")
    ),
}

# =============================================================================
# CONTENU DES NOTES - MARIANNE (ENSEIGNANTE)
# =============================================================================

MARIANNE_NOTES_CONTENT = {
    "Intro Programmation": _doc(
        _heading(1, "Introduction à la programmation"),
        _heading(2, "Objectifs du cours"),
        _bullet_list(
            "Comprendre les concepts fondamentaux",
            "Apprendre à résoudre des problèmes",
            "Maîtriser un premier langage (Python)"
        ),
        _heading(2, "Qu'est-ce qu'un programme ?"),
        _paragraph(_text("Un programme est une "), _text("séquence d'instructions", bold=True), _text(" que l'ordinateur exécute pour accomplir une tâche.")),
        _heading(2, "Concepts de base"),
        _ordered_list(
            [_text("Variables", bold=True), _text(" : Stocker des données")],
            [_text("Conditions", bold=True), _text(" : Prendre des décisions")],
            [_text("Boucles", bold=True), _text(" : Répéter des actions")],
            [_text("Fonctions", bold=True), _text(" : Organiser le code")]
        ),
        _heading(2, "Premier programme"),
        _code_block("""# Mon premier programme Python
print("Hello, World!")

# Avec une variable
nom = "Alice"
print(f"Bonjour, {nom}!")""", "python")
    ),

    "Variables et Types": _doc(
        _heading(1, "Variables et types de données"),
        _heading(2, "Déclaration de variables"),
        _code_block("""# En Python, pas besoin de déclarer le type
age = 25              # int
prix = 19.99          # float
nom = "Alice"         # str
actif = True          # bool""", "python"),
        _heading(2, "Types primitifs"),
        _bullet_list(
            [_text("int", code=True), _text(" : Entier (42, -7, 0)")],
            [_text("float", code=True), _text(" : Décimal (3.14, -0.5)")],
            [_text("str", code=True), _text(" : Chaîne (\"Hello\")")],
            [_text("bool", code=True), _text(" : Booléen (True, False)")]
        ),
        _heading(2, "Conversion de types"),
        _code_block("""x = "42"
y = int(x)      # str -> int
z = float(x)    # str -> float
s = str(42)     # int -> str""", "python"),
        _heading(2, "Bonnes pratiques"),
        _bullet_list(
            [_text("Noms explicites : "), _text("age_utilisateur", code=True), _text(" plutôt que "), _text("x", code=True)],
            "snake_case en Python",
            [_text("Constantes en MAJUSCULES : "), _text("MAX_SIZE = 100", code=True)]
        )
    ),

    "Structures de contrôle": _doc(
        _heading(1, "Structures de contrôle"),
        _heading(2, "Conditions (if/elif/else)"),
        _code_block("""age = 18

if age < 18:
    print("Mineur")
elif age == 18:
    print("Tout juste majeur")
else:
    print("Majeur")""", "python"),
        _heading(2, "Opérateurs de comparaison"),
        _bullet_list(
            [_text("==", code=True), _text(" : Égalité")],
            [_text("!=", code=True), _text(" : Différence")],
            [_text("<", code=True), _text(", "), _text(">", code=True), _text(" : Inférieur, supérieur")],
            [_text("<=", code=True), _text(", "), _text(">=", code=True), _text(" : Inférieur ou égal, supérieur ou égal")]
        ),
        _heading(2, "Opérateurs logiques"),
        _code_block("""if age >= 18 and permis:
    print("Peut conduire")

if weekend or vacances:
    print("Repos!")

if not travail:
    print("Libre")""", "python")
    ),

    "Boucles": _doc(
        _heading(1, "Les boucles"),
        _heading(2, "Boucle for"),
        _code_block("""# Parcourir une liste
fruits = ["pomme", "banane", "orange"]
for fruit in fruits:
    print(fruit)

# Range
for i in range(5):      # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 10, 2):  # 2, 4, 6, 8
    print(i)""", "python"),
        _heading(2, "Boucle while"),
        _code_block("""compteur = 0
while compteur < 5:
    print(compteur)
    compteur += 1""", "python"),
        _heading(2, "Contrôle de boucle"),
        _code_block("""# break : sortir de la boucle
for i in range(10):
    if i == 5:
        break
    print(i)  # 0, 1, 2, 3, 4

# continue : passer à l'itération suivante
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0, 1, 3, 4""", "python"),
        _heading(2, "Exercice type"),
        _paragraph(_text("Afficher tous les nombres pairs de 1 à 20."))
    ),

    "Fonctions": _doc(
        _heading(1, "Les fonctions"),
        _heading(2, "Définition"),
        _code_block("""def saluer(nom):
    \"\"\"Affiche un message de salutation.\"\"\"
    print(f"Bonjour, {nom}!")

saluer("Alice")  # Bonjour, Alice!""", "python"),
        _heading(2, "Retour de valeur"),
        _code_block("""def addition(a, b):
    return a + b

resultat = addition(3, 5)  # 8""", "python"),
        _heading(2, "Paramètres par défaut"),
        _code_block("""def saluer(nom, message="Bonjour"):
    print(f"{message}, {nom}!")

saluer("Alice")           # Bonjour, Alice!
saluer("Bob", "Salut")    # Salut, Bob!""", "python"),
        _heading(2, "Arguments nommés"),
        _code_block("""def creer_profil(nom, age, ville):
    return f"{nom}, {age} ans, {ville}"

profil = creer_profil(age=25, ville="Paris", nom="Alice")""", "python"),
        _heading(2, "Docstrings"),
        _paragraph(_text("Toujours documenter vos fonctions !")),
        _code_block("""def calculer_moyenne(notes):
    \"\"\"
    Calcule la moyenne d'une liste de notes.

    Args:
        notes: Liste de nombres

    Returns:
        La moyenne des notes
    \"\"\"
    return sum(notes) / len(notes)""", "python")
    ),

    "Listes et Dictionnaires": _doc(
        _heading(1, "Collections : Listes et Dictionnaires"),
        _heading(2, "Listes"),
        _code_block("""# Création
fruits = ["pomme", "banane", "orange"]
nombres = [1, 2, 3, 4, 5]
mixte = [1, "deux", 3.0, True]

# Accès
print(fruits[0])     # pomme
print(fruits[-1])    # orange (dernier)

# Modification
fruits.append("kiwi")       # Ajouter
fruits.remove("banane")     # Supprimer
fruits[0] = "poire"         # Modifier""", "python"),
        _heading(2, "Slicing"),
        _code_block("""liste = [0, 1, 2, 3, 4, 5]
print(liste[1:4])    # [1, 2, 3]
print(liste[:3])     # [0, 1, 2]
print(liste[3:])     # [3, 4, 5]
print(liste[::2])    # [0, 2, 4]""", "python"),
        _heading(2, "Dictionnaires"),
        _code_block("""# Création
etudiant = {
    "nom": "Alice",
    "age": 20,
    "notes": [15, 18, 12]
}

# Accès
print(etudiant["nom"])        # Alice
print(etudiant.get("ville"))  # None (pas d'erreur)

# Modification
etudiant["age"] = 21
etudiant["ville"] = "Paris"

# Parcours
for cle, valeur in etudiant.items():
    print(f"{cle}: {valeur}")""", "python")
    ),

    "Fichiers": _doc(
        _heading(1, "Manipulation de fichiers"),
        _heading(2, "Lecture"),
        _code_block("""# Méthode recommandée (with)
with open("fichier.txt", "r") as f:
    contenu = f.read()

# Ligne par ligne
with open("fichier.txt", "r") as f:
    for ligne in f:
        print(ligne.strip())

# Toutes les lignes en liste
with open("fichier.txt", "r") as f:
    lignes = f.readlines()""", "python"),
        _heading(2, "Écriture"),
        _code_block("""# Écrire (écrase le fichier)
with open("fichier.txt", "w") as f:
    f.write("Hello World\\n")

# Ajouter (append)
with open("fichier.txt", "a") as f:
    f.write("Nouvelle ligne\\n")""", "python"),
        _heading(2, "Fichiers CSV"),
        _code_block("""import csv

# Lecture
with open("data.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["nom"], row["age"])

# Écriture
with open("data.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["nom", "age"])
    writer.writeheader()
    writer.writerow({"nom": "Alice", "age": 25})""", "python")
    ),

    "Exceptions": _doc(
        _heading(1, "Gestion des exceptions"),
        _heading(2, "Try/Except"),
        _code_block("""try:
    resultat = 10 / 0
except ZeroDivisionError:
    print("Division par zéro impossible!")""", "python"),
        _heading(2, "Plusieurs exceptions"),
        _code_block("""try:
    valeur = int(input("Entrez un nombre: "))
    resultat = 10 / valeur
except ValueError:
    print("Ce n'est pas un nombre!")
except ZeroDivisionError:
    print("Division par zéro!")
except Exception as e:
    print(f"Erreur inattendue: {e}")""", "python"),
        _heading(2, "Finally"),
        _code_block("""try:
    f = open("fichier.txt")
    # traitement...
except FileNotFoundError:
    print("Fichier non trouvé")
finally:
    f.close()  # Toujours exécuté""", "python"),
        _heading(2, "Lever une exception"),
        _code_block("""def diviser(a, b):
    if b == 0:
        raise ValueError("Le diviseur ne peut pas être zéro")
    return a / b""", "python"),
        _heading(2, "Exceptions personnalisées"),
        _code_block("""class NoteInvalideError(Exception):
    pass

def ajouter_note(note):
    if not 0 <= note <= 20:
        raise NoteInvalideError(f"Note {note} invalide")""", "python")
    ),

    "POO Bases": _doc(
        _heading(1, "Programmation Orientée Objet - Bases"),
        _heading(2, "Classe et objet"),
        _code_block("""class Etudiant:
    def __init__(self, nom, age):
        self.nom = nom
        self.age = age
        self.notes = []

    def ajouter_note(self, note):
        self.notes.append(note)

    def moyenne(self):
        if not self.notes:
            return 0
        return sum(self.notes) / len(self.notes)

# Utilisation
alice = Etudiant("Alice", 20)
alice.ajouter_note(15)
alice.ajouter_note(18)
print(alice.moyenne())  # 16.5""", "python"),
        _heading(2, "Attributs de classe vs instance"),
        _code_block("""class Compteur:
    total = 0  # Attribut de classe

    def __init__(self):
        Compteur.total += 1
        self.numero = Compteur.total  # Attribut d'instance""", "python"),
        _heading(2, "Méthodes spéciales"),
        _code_block("""class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"Point({self.x}, {self.y})"

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)""", "python")
    ),

    "POO Héritage": _doc(
        _heading(1, "Héritage en POO"),
        _heading(2, "Héritage simple"),
        _code_block("""class Animal:
    def __init__(self, nom):
        self.nom = nom

    def parler(self):
        raise NotImplementedError

class Chien(Animal):
    def parler(self):
        return "Wouf!"

class Chat(Animal):
    def parler(self):
        return "Miaou!"

rex = Chien("Rex")
print(rex.parler())  # Wouf!""", "python"),
        _heading(2, "Super()"),
        _code_block("""class Vehicule:
    def __init__(self, marque):
        self.marque = marque

class Voiture(Vehicule):
    def __init__(self, marque, nb_portes):
        super().__init__(marque)
        self.nb_portes = nb_portes""", "python"),
        _heading(2, "Polymorphisme"),
        _code_block("""def faire_parler(animal):
    print(animal.parler())

animaux = [Chien("Rex"), Chat("Minou")]
for animal in animaux:
    faire_parler(animal)""", "python"),
        _heading(2, "Classes abstraites"),
        _code_block("""from abc import ABC, abstractmethod

class Forme(ABC):
    @abstractmethod
    def aire(self):
        pass

class Rectangle(Forme):
    def __init__(self, l, L):
        self.l = l
        self.L = L

    def aire(self):
        return self.l * self.L""", "python")
    ),

    "Tests unitaires": _doc(
        _heading(1, "Tests unitaires avec pytest"),
        _heading(2, "Premier test"),
        _code_block("""# calculator.py
def addition(a, b):
    return a + b

# test_calculator.py
from calculator import addition

def test_addition():
    assert addition(2, 3) == 5
    assert addition(-1, 1) == 0
    assert addition(0, 0) == 0""", "python"),
        _heading(2, "Lancer les tests"),
        _code_block("""pytest                    # Tous les tests
pytest test_file.py       # Un fichier
pytest -v                 # Verbose
pytest -k "test_add"      # Par nom""", "bash"),
        _heading(2, "Fixtures"),
        _code_block("""import pytest

@pytest.fixture
def etudiant():
    return Etudiant("Alice", 20)

def test_ajouter_note(etudiant):
    etudiant.ajouter_note(15)
    assert len(etudiant.notes) == 1""", "python"),
        _heading(2, "Tester les exceptions"),
        _code_block("""def test_division_par_zero():
    with pytest.raises(ZeroDivisionError):
        diviser(10, 0)""", "python"),
        _heading(2, "Couverture"),
        _code_block("""pytest --cov=mon_module --cov-report=html""", "bash")
    ),

    "Bonnes pratiques": _doc(
        _heading(1, "Bonnes pratiques de programmation"),
        _heading(2, "Lisibilité"),
        _bullet_list(
            "Noms de variables explicites",
            "Fonctions courtes (< 20 lignes)",
            "Une fonction = une responsabilité",
            "Commentaires utiles, pas évidents"
        ),
        _heading(2, "PEP 8 (Python)"),
        _bullet_list(
            "Indentation : 4 espaces",
            "Lignes : max 79 caractères",
            "snake_case pour fonctions/variables",
            "PascalCase pour classes",
            "MAJUSCULES pour constantes"
        ),
        _heading(2, "DRY - Don't Repeat Yourself"),
        _code_block("""# ❌ Mauvais
def saluer_alice():
    print("Bonjour Alice!")
def saluer_bob():
    print("Bonjour Bob!")

# ✅ Bon
def saluer(nom):
    print(f"Bonjour {nom}!")""", "python"),
        _heading(2, "KISS - Keep It Simple"),
        _paragraph(_text("Préférer une solution simple à une solution complexe, même si elle est moins \"élégante\".")),
        _heading(2, "Documentation"),
        _bullet_list(
            "Docstrings pour les fonctions publiques",
            "README pour le projet",
            "Commentaires pour la logique complexe"
        )
    ),
}


# =============================================================================
# FLASHCARDS
# =============================================================================

SOPHIE_FLASHCARDS = [
    ("Quels sont les 3 principes fondamentaux de la phytothérapie ?",
     [("Totum, Terrain, Prévention", True),
      ("Plante, Dosage, Durée", False),
      ("Infusion, Décoction, Macération", False)]),
    ("Quelle est la famille botanique de la Camomille romaine ?",
     [("Asteraceae", True),
      ("Lamiaceae", False),
      ("Apiaceae", False)]),
    ("Quel est le principal principe actif sédatif de la Valériane ?",
     [("Acide valérénique", True),
      ("Hypéricine", False),
      ("Silymarine", False)]),
    ("Pourquoi le Millepertuis est-il contre-indiqué avec certains médicaments ?",
     [("C'est un inducteur enzymatique puissant (CYP3A4)", True),
      ("Il provoque des allergies", False),
      ("Il augmente la tension artérielle", False)]),
    ("Quelle plante est recommandée pour le soutien hépatique ?",
     [("Chardon-marie", True),
      ("Valériane", False),
      ("Échinacée", False)]),
    ("Quelle est l'indication principale du Tea tree (Melaleuca) ?",
     [("Antiseptique à large spectre", True),
      ("Sédatif", False),
      ("Anti-inflammatoire articulaire", False)]),
    ("Quelle plante adaptogène est recommandée pour la fatigue intellectuelle ?",
     [("Éleuthérocoque", True),
      ("Passiflore", False),
      ("Aubépine", False)]),
    ("Quelle est la durée maximale recommandée pour une cure d'Échinacée ?",
     [("10 jours", True),
      ("1 mois", False),
      ("3 mois", False)]),
    ("Quel type de toux traite-t-on avec la Mauve et la Guimauve ?",
     [("Toux sèche", True),
      ("Toux grasse", False),
      ("Toux allergique", False)]),
    ("Quelle plante veinotonique contient des anthocyanes ?",
     [("Vigne rouge", True),
      ("Hamamélis", False),
      ("Petit houx", False)]),
]

ANDREAS_FLASHCARDS = [
    ("Quelle est la complexité d'une recherche binaire ?",
     [("O(log n)", True),
      ("O(n)", False),
      ("O(n²)", False),
      ("O(1)", False)]),
    ("Quelle est la complexité moyenne du QuickSort ?",
     [("O(n log n)", True),
      ("O(n²)", False),
      ("O(n)", False)]),
    ("Quel algorithme de parcours utilise une file (queue) ?",
     [("BFS (Breadth-First Search)", True),
      ("DFS (Depth-First Search)", False),
      ("Dijkstra", False)]),
    ("Quelle commande SQL permet de filtrer les groupes après un GROUP BY ?",
     [("HAVING", True),
      ("WHERE", False),
      ("FILTER", False)]),
    ("Quel principe SOLID signifie 'Ouvert à l'extension, fermé à la modification' ?",
     [("Open/Closed Principle", True),
      ("Single Responsibility", False),
      ("Liskov Substitution", False)]),
    ("Quel design pattern garantit une instance unique d'une classe ?",
     [("Singleton", True),
      ("Factory", False),
      ("Observer", False)]),
    ("Quelle commande Git permet d'annuler le dernier commit en gardant les modifications ?",
     [("git reset HEAD~1", True),
      ("git revert HEAD", False),
      ("git checkout HEAD~1", False)]),
    ("Quel code HTTP indique une ressource créée avec succès ?",
     [("201 Created", True),
      ("200 OK", False),
      ("204 No Content", False)]),
    ("Quel hook React permet d'effectuer des effets de bord ?",
     [("useEffect", True),
      ("useState", False),
      ("useMemo", False)]),
    ("Quelle méthode HTTP est idempotente et remplace entièrement une ressource ?",
     [("PUT", True),
      ("POST", False),
      ("PATCH", False)]),
]

MARIANNE_FLASHCARDS = [
    ("En Python, quel est le type de la valeur 3.14 ?",
     [("float", True),
      ("int", False),
      ("str", False),
      ("decimal", False)]),
    ("Quelle structure de contrôle permet de répéter une action tant qu'une condition est vraie ?",
     [("while", True),
      ("for", False),
      ("if", False)]),
    ("Comment ajouter un élément à la fin d'une liste en Python ?",
     [("liste.append(element)", True),
      ("liste.add(element)", False),
      ("liste.push(element)", False)]),
    ("Quel mot-clé permet de sortir d'une boucle prématurément ?",
     [("break", True),
      ("continue", False),
      ("return", False),
      ("exit", False)]),
    ("Comment accéder à la valeur associée à la clé 'nom' dans un dictionnaire d ?",
     [("d['nom'] ou d.get('nom')", True),
      ("d.nom", False),
      ("d(nom)", False)]),
    ("Quel est le mode d'ouverture de fichier pour ajouter du contenu sans écraser ?",
     [("'a' (append)", True),
      ("'w' (write)", False),
      ("'r' (read)", False)]),
    ("Quel bloc est toujours exécuté, qu'il y ait une exception ou non ?",
     [("finally", True),
      ("except", False),
      ("else", False)]),
    ("Comment appeler le constructeur de la classe parente en Python ?",
     [("super().__init__()", True),
      ("parent.__init__()", False),
      ("self.parent()", False)]),
    ("Quel décorateur pytest permet de créer des données de test réutilisables ?",
     [("@pytest.fixture", True),
      ("@pytest.mark", False),
      ("@pytest.setup", False)]),
    ("Que signifie le principe DRY ?",
     [("Don't Repeat Yourself", True),
      ("Do Repeat Yourself", False),
      ("Don't Run Yourself", False)]),
]


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

        # Notes de Sophie - Phytothérapie
        sophie_notes = {}
        phyto_notes_data = [
            ("Phytothérapie - Introduction", ["phytothérapie", "bases", "introduction"]),
            ("Camomille romaine", ["camomille", "digestif", "calmant"]),
            ("Lavande officinale", ["lavande", "anxiolytique", "cicatrisant"]),
            ("Valériane", ["valériane", "sommeil", "sédatif"]),
            ("Millepertuis", ["millepertuis", "antidépresseur", "interactions"]),
            ("Échinacée - Immunité", ["échinacée", "immunité", "infections"]),
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

        # Notes de Sophie - Aromathérapie
        aroma_notes_data = [
            ("Aromathérapie - Bases", ["aromathérapie", "bases", "HE"]),
            ("Tea tree - Antiseptique", ["tea tree", "antiseptique", "infections"]),
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

        # Notes de Sophie - Pathologies
        patho_notes_data = [
            ("Troubles digestifs - Approche", ["digestion", "dyspepsie", "foie"]),
            ("Stress et anxiété", ["stress", "anxiété", "adaptogènes"]),
            ("Pathologies hivernales", ["rhume", "toux", "immunité"]),
            ("Gestion du sommeil", ["sommeil", "insomnie", "sédatifs"]),
            ("Douleurs articulaires", ["articulations", "arthrose", "anti-inflammatoire"]),
            ("Détox hépatique", ["foie", "détox", "chardon-marie"]),
            ("Circulation veineuse", ["veines", "jambes lourdes", "veinotonique"]),
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
        print("Sophie's collections and notes inserted (15 notes).")

        # Liens entre notes de Sophie (navigation interconnectée)
        sophie_links = [
            ("Phytothérapie - Introduction", "Camomille romaine", "exemple plante"),
            ("Camomille romaine", "Troubles digestifs - Approche", "indication"),
            ("Camomille romaine", "Gestion du sommeil", "indication"),
            ("Lavande officinale", "Stress et anxiété", "indication"),
            ("Lavande officinale", "Aromathérapie - Bases", "forme galénique"),
            ("Valériane", "Gestion du sommeil", "indication principale"),
            ("Valériane", "Stress et anxiété", "indication"),
            ("Millepertuis", "Stress et anxiété", "indication"),
            ("Échinacée - Immunité", "Pathologies hivernales", "prévention"),
            ("Tea tree - Antiseptique", "Aromathérapie - Bases", "HE courante"),
            ("Tea tree - Antiseptique", "Pathologies hivernales", "traitement"),
            ("Troubles digestifs - Approche", "Détox hépatique", "lien foie"),
            ("Stress et anxiété", "Gestion du sommeil", "trouble associé"),
            ("Douleurs articulaires", "Aromathérapie - Bases", "usage externe"),
        ]
        for src, tgt, label in sophie_links:
            if src in sophie_notes and tgt in sophie_notes:
                session.add(NoteLink(
                    note_id_1=sophie_notes[src].id,
                    note_id_2=sophie_notes[tgt].id,
                    label=label,
                ))
        print("Sophie's note links inserted (14 links).")

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

        # Notes de Luc - Projet
        luc_notes = {}
        projet_notes_data = [
            ("Architecture projet", ["architecture", "stack", "structure"]),
            ("API REST - Endpoints", ["API", "REST", "endpoints"]),
            ("Modèle de données", ["BDD", "Prisma", "modèle"]),
            ("Guide React hooks", ["React", "hooks", "frontend"]),
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
        print("Luc's collections and notes inserted (10 notes).")

        # Liens entre notes de Luc
        luc_links = [
            ("Architecture projet", "API REST - Endpoints", "définit"),
            ("Architecture projet", "Modèle de données", "structure"),
            ("API REST - Endpoints", "Modèle de données", "utilise"),
            ("Guide React hooks", "Architecture projet", "frontend"),
            ("Réunion Sprint 1", "Architecture projet", "objectif"),
            ("Réunion Sprint 2", "Réunion Sprint 1", "suite"),
            ("Setup environnement", "Architecture projet", "prérequis"),
            ("Tests - Guide", "Déploiement CI/CD", "étape CI"),
            ("Design System", "Guide React hooks", "styles"),
        ]
        for src, tgt, label in luc_links:
            if src in luc_notes and tgt in luc_notes:
                session.add(NoteLink(
                    note_id_1=luc_notes[src].id,
                    note_id_2=luc_notes[tgt].id,
                    label=label,
                ))
        print("Luc's note links inserted (9 links).")

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

        # Notes d'Andréas
        andreas_notes = {}
        algo_notes_data = [
            ("Algo - Complexité", ["complexité", "O(n)", "performance"]),
            ("Algo - Tri", ["tri", "quicksort", "mergesort"]),
            ("Algo - Graphes", ["graphes", "BFS", "DFS"]),
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

        bdd_notes_data = [
            ("SQL - Bases", ["SQL", "SELECT", "JOIN"]),
            ("SQL - Avancé", ["SQL", "CTE", "Window"]),
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

        dev_notes_data = [
            ("POO - Principes", ["POO", "SOLID", "encapsulation"]),
            ("Design Patterns", ["patterns", "singleton", "factory"]),
            ("Git - Commandes", ["git", "versionning", "commandes"]),
            ("HTTP - Protocole", ["HTTP", "REST", "API"]),
            ("React - Hooks", ["React", "hooks", "frontend"]),
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
        print("Andreas's collections and notes inserted (10 notes).")

        # Liens entre notes d'Andréas
        andreas_links = [
            ("Algo - Complexité", "Algo - Tri", "appliqué aux tris"),
            ("Algo - Complexité", "Algo - Graphes", "appliqué aux graphes"),
            ("SQL - Bases", "SQL - Avancé", "approfondir"),
            ("POO - Principes", "Design Patterns", "applique SOLID"),
            ("HTTP - Protocole", "React - Hooks", "appels API"),
        ]
        for src, tgt, label in andreas_links:
            if src in andreas_notes and tgt in andreas_notes:
                session.add(NoteLink(
                    note_id_1=andreas_notes[src].id,
                    note_id_2=andreas_notes[tgt].id,
                    label=label,
                ))
        print("Andreas's note links inserted (5 links).")

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

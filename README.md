# Backend Memora — Documentation développeur

## 1) Contexte rapide

### Que fait ce backend ?

Backend Flask pour **Memora**, une application de prise de notes collaborative avec système de révision espacée et flashcards.

### Statut actuel

**V2 actif** — Fonctionnalités principales implémentées, collaboration temps réel en production avec CRDT (Yjs).

### Périmètre exact

**Inclus** :
- Authentification JWT + gestion utilisateurs
- CRUD notes & collections (avec tags, visibilité, favoris)
- Partage de notes/collections avec permissions granulaires (lecture/écriture/commentaire)
- Liens publics de partage (share links)
- Relations bidirectionnelles entre notes (note links)
- Flashcards + algorithme de révision espacée
- Statistiques utilisateur (temps de révision, taux de réussite)
- Upload d'images (local ou S3-compatible)
- Collaboration temps réel via WebSocket (Socket.IO + CRDT Yjs)
- Rapports de contenu (signalements)

**Exclu** :
- Notifications push
- Export PDF/Markdown
- Intégrations tierces (Google Drive, Notion, etc.)
- Interface d'administration web

---

## 2) Prérequis & versions

### Versions requises

- **Python** : `>= 3.13`
- **Base de données** : PostgreSQL `>= 14` (production) ou SQLite (dev/test)
- **Redis** : `>= 7.0` (obligatoire pour collaboration temps réel)
- **Docker** : `>= 20.10` (pour SeaweedFS S3)

### Dépendances système

- **libpq-dev** (pour psycopg2 sur Linux/macOS)
- **Redis Server** (pour sessions de collaboration)
- **Docker & Docker Compose** (pour stockage S3 local via SeaweedFS)
- **compilateur c/c++**

### Gestion d'environnement virtuel

Utilisation de **venv** (standard Python) recommandée :

```bash
python -m venv venv
```

---

## 3) Installation

### Étapes d'installation

```bash
# 1. Cloner le dépôt
cd memora_back

# 2. Créer l'environnement virtuel
python -m venv venv

# 3. Activer l'environnement
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# 4. Installer les dépendances
pip install -r requirements.txt

# 5. Lancer le backend une premiere fois
python app.py

# 6. Initialiser la BD et creer le super_admin (apres le premier lancement)
python scripts/init_db.py --email superadmin@example.com --username superadmin --password "SuperAdminPass123!"
```

### Fichiers à ignorer (.gitignore)

Le `.gitignore` est déjà configuré pour exclure :
- `.env` (secrets)
- `venv/`, `__pycache__/`, `.pytest_cache/`
- `logs/`, `uploads/**`
- `*.db` (bases SQLite locales)
- `s3example/data/` (données SeaweedFS)

---

## 4) Configuration (.env)

### Variables obligatoires

Copiez `.env.example` vers `.env` et configurez :

```bash
cp .env.example .env
```

#### Variables critiques

| Variable | Valeur par defaut | Description |
|----------|------------------|-------------|
| `SQLALCHEMY_DATABASE_URI` | `sqlite:///app.db` | URL de connexion BD (SQLite en dev par defaut, Postgres en prod) |
| `JWT_SECRET_KEY` | `change-me` | **Obligatoire en prod** - Secret pour tokens JWT |
| `JWT_ACCESS_TOKEN_EXPIRES_SECONDS` | `86400` | Duree de validite du token (en secondes) |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Origines CORS autorisees (obligatoire en prod) |
| `SWAGGER_ENABLED` | `1` | Active Swagger en dev/test (ignore en prod) |

#### Redis (collaboration temps réel)

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `REDIS_HOST` | `localhost` | Hôte Redis |
| `REDIS_PORT` | `6379` | Port Redis |
| `REDIS_DB` | `0` | Index de base Redis |
| `COLLAB_SESSION_TTL_SECONDS` | `86400` | Durée de vie des sessions (24h) |

#### Upload d'images

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `STORAGE_DRIVER` | `local` | Mode de stockage (`local` ou `s3`) |
| `UPLOAD_LOCAL_ROOT` | `uploads` | Répertoire local pour uploads |
| `IMAGE_MAX_CONTENT_LENGTH_BYTES` | `5242880` | Taille max (5 Mo) |

#### S3-compatible (SeaweedFS, MinIO, AWS S3)

```env
STORAGE_DRIVER=s3
STORAGE_S3_BUCKET=memora-uploads
STORAGE_S3_ENDPOINT_URL=http://localhost:8333
STORAGE_S3_REGION=eu-west-1
STORAGE_S3_ACCESS_KEY=memora
STORAGE_S3_SECRET_KEY=memora-secret
STORAGE_S3_PUBLIC_BASE_URL=http://localhost:8333/memora-uploads
```

### Ou placer le `.env` ?

A la **racine du projet** (`.env`). Il est charge automatiquement via `python-dotenv` dans [config.py](config.py#L5).

---

## 5) Configuration du stockage S3 (SeaweedFS)

### Pourquoi SeaweedFS ?

SeaweedFS est un système de stockage distribué compatible S3, **gratuit et open-source**. Il permet de :
- Stocker les images uploadées par les utilisateurs
- Simuler un environnement S3 sans compte AWS
- Tester le backend en conditions réelles

### Architecture du dossier `s3example/`

```
s3example/
├── docker-compose.yaml    # Configuration Docker pour SeaweedFS
├── s3.json               # Configuration des identités et permissions S3
└── data/                 # Données persistantes SeaweedFS (créé automatiquement)
```

### Fichier `s3.json`

Configure les credentials S3 pour l'application :

```json
{
    "identities": [
        {
            "name": "memora",
            "credentials": [
                {
                    "accessKey": "memora",
                    "secretKey": "memora-secret"
                }
            ],
            "actions": ["Read", "Write", "List"],
            "allowed_buckets": ["memora-uploads"]
        }
    ]
}
```

**Important** : Les valeurs `accessKey` et `secretKey` doivent correspondre aux variables `STORAGE_S3_ACCESS_KEY` et `STORAGE_S3_SECRET_KEY` dans votre `.env`.

### Fichier `docker-compose.yaml`

Lance SeaweedFS avec les ports exposés :

```yaml
services:
  seaweedfs:
    image: chrislusf/seaweedfs:latest
    container_name: seaweedfs
    command:
      - server
      - -s3
      - -filer
      - -dir=/data
      - -ip=seaweedfs
      - -ip.bind=0.0.0.0
      - -s3.config=/etc/seaweedfs/s3.json
    ports:
      - "8333:8333"  # S3 API
      - "8888:8888"  # Filer
      - "9333:9333"  # Master
    volumes:
      - ./data:/data
      - ./s3.json:/etc/seaweedfs/s3.json:ro
    restart: unless-stopped
```

### Lancer SeaweedFS

#### 1. Démarrer le conteneur Docker

```bash
# creer un dossier s3 avec le même contenu que s3 example
cp s3exemple s3

# Créer le dossier data avec les bonnes permissions
mkdir -p data
sudo chmod 777 data/

# Démarrer SeaweedFS avec docker-compose
sudo docker-compose -f docker-compose.yaml up -d

# Vérifier que le conteneur tourne
sudo docker ps | grep seaweedfs

# Vérifier les logs (aucune erreur ne devrait apparaître)
sudo docker logs seaweedfs
```

#### 2. Tester l'accès S3

```bash
# Le port 8333 devrait répondre
curl http://localhost:8333

# Réponse attendue : Page HTML SeaweedFS
```

#### 3. Initialiser le bucket S3

Une fois SeaweedFS en marche, **initialisez le bucket** avec le script fourni :

```bash
# Retourner à la racine du projet backend
cd ..

# Activer l'environnement virtuel si pas déjà fait
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate  # Windows

# Exécuter le script d'initialisation S3
python scripts/init_s3.py
```

**Sortie attendue** :

```
Bucket already exists: memora-uploads
Applying public read policy to bucket: memora-uploads
Done.
```

Ou si le bucket n'existait pas :

```
Creating bucket: memora-uploads
Applying public read policy to bucket: memora-uploads
Done.
```

#### 4. Configurer le backend

Vérifiez que votre `.env` contient :

```env
STORAGE_DRIVER=s3
STORAGE_S3_BUCKET=memora-uploads
STORAGE_S3_ENDPOINT_URL=http://localhost:8333
STORAGE_S3_REGION=eu-west-1
STORAGE_S3_ACCESS_KEY=memora
STORAGE_S3_SECRET_KEY=memora-secret
STORAGE_S3_PUBLIC_BASE_URL=http://localhost:8333/memora-uploads
```

### Troubleshooting SeaweedFS

#### Problème : Le conteneur redémarre en boucle

**Symptôme** : `docker ps` montre `Restarting (255)`

**Solution** :

```bash
# Vérifier les logs pour voir l'erreur
sudo docker logs seaweedfs

# Si erreur de permissions sur /data :
cd s3example
sudo chmod -R 777 data/

# Supprimer et recréer le conteneur
sudo docker stop seaweedfs
sudo docker rm seaweedfs
sudo docker-compose -f docker-compose.yaml up -d
```

#### Problème : `init_s3.py` échoue avec "Could not connect"

**Symptôme** : `Could not connect to the endpoint URL: "http://localhost:8333/memora-uploads"`

**Cause** : SeaweedFS n'est pas démarré ou pas accessible.

**Solution** :

```bash
# 1. Vérifier que le conteneur tourne
sudo docker ps | grep seaweedfs

# 2. Tester l'accès au port 8333
curl http://localhost:8333

# 3. Si aucune réponse, redémarrer SeaweedFS
cd s3example
sudo docker-compose -f docker-compose.yaml restart

# 4. Attendre 10 secondes puis réessayer init_s3.py
```

#### Problème : Upload d'images retourne 404

**Symptôme** : L'upload réussit (201 CREATED) mais l'image retourne 404 lors de l'accès.

**Causes possibles** :

1. **Le bucket n'existe pas** → Exécuter `python scripts/init_s3.py`
2. **Mauvaises credentials dans `.env`** → Vérifier que `STORAGE_S3_ACCESS_KEY` et `STORAGE_S3_SECRET_KEY` correspondent à `s3.json`
3. **SeaweedFS arrêté** → Vérifier `sudo docker ps | grep seaweedfs`
4. **URL publique incorrecte** → Vérifier `STORAGE_S3_PUBLIC_BASE_URL` dans `.env`

**Solution** :

```bash
# 1. Vérifier que SeaweedFS tourne
sudo docker ps | grep seaweedfs

# 2. Réinitialiser le bucket
python scripts/init_s3.py

# 3. Tester l'upload manuellement avec curl
curl -X POST http://localhost:8333/memora-uploads \
  -H "Authorization: AWS memora:memora-secret" \
  -F "file=@test.jpg"

# 4. Redémarrer le backend Flask
python app.py
```

### Utilisation en production

Pour un déploiement production, **remplacez SeaweedFS par** :
- **AWS S3** (recommandé)
- **MinIO** (auto-hébergé, compatible S3)
- **Backblaze B2** (moins cher qu'AWS)

Modifiez simplement les variables d'environnement dans `.env` :

```env
STORAGE_S3_ENDPOINT_URL=https://s3.eu-west-1.amazonaws.com
STORAGE_S3_ACCESS_KEY=<votre-clé-aws>
STORAGE_S3_SECRET_KEY=<votre-secret-aws>
STORAGE_S3_PUBLIC_BASE_URL=https://memora-uploads.s3.eu-west-1.amazonaws.com
```

---

## 6) Lancement en local

### Démarrer le serveur (mode développement)

```bash
# Avec rechargement automatique (recommandé en dev)
python app.py
```

Le serveur démarre sur **`http://0.0.0.0:5000`** par défaut.

### Port d'écoute

- **Port par défaut** : `5000`
- **Modifiable** dans [app.py](app.py#L108) : `socketio_service.run_socketio(app, debug=True, host="0.0.0.0", port=5000)`

---

## 7) Architecture du code

### Organisation par domaine

```
memora_back/
├── controllers/           # Blueprints Flask (HTTP + WebSocket)
│   ├── auth_controller.py
│   ├── note_controller.py
│   ├── collection_controller.py
│   ├── flashcard_controller.py
│   ├── realtime/          # Handlers WebSocket (collaboration CRDT)
│   └── ...
├── domain_services/       # Logique métier complexe (cross-entity)
│   ├── collection_domain_service.py
│   ├── flashcard_domain_service.py
│   └── ...
├── services/              # Services métier (business logic)
│   ├── interfaces/        # Contrats d'interface
│   └── impl/              # Implémentations
│       ├── auth_service_impl.py
│       ├── note/          # Services notes/flashcards/partage
│       ├── collection/    # Services collections/partage
│       ├── realtime/      # Services collaboration CRDT + WebSocket
│       └── infrastructure/ # Redis, session store
├── repositorys/           # Accès données (repositories pattern)
│   ├── note_repository.py
│   ├── collection_repository.py
│   └── ...
├── daos/                  # Modèles SQLAlchemy (entities)
│   ├── user_dao.py
│   ├── note_dao.py
│   ├── collection_dao.py
│   └── base_models.py     # Mixins (UUID, Timestamp, Owner...)
├── dtos/                  # Data Transfer Objects (Pydantic)
│   ├── note_dto.py
│   ├── collection_dto.py
│   └── ...
├── mappers/               # Conversion DAO ↔ DTO
│   ├── note_mapper.py
│   ├── collection_mapper.py
│   └── ...
├── querys/                # Requêtes complexes isolées
│   ├── note_query.py
│   ├── collection_query.py
│   └── ...
├── exceptions/            # Exceptions métier custom
│   ├── note_exception.py
│   ├── collection_exception.py
│   └── ...
├── utils/                 # Utilitaires transverses
│   ├── db.py              # Instance SQLAlchemy
│   ├── jwt.py             # Configuration JWT
│   ├── filter.py          # Error handler global
│   ├── logger.py          # Logger centralisé
│   ├── swagger.py         # Documentation API (Flasgger)
│   └── ...
├── tests/                 # Tests unitaires + intégration
│   ├── controllers/
│   ├── services/
│   └── repositorys/
├── scripts/               # Scripts utilitaires
│   ├── init_s3.py         # Initialisation bucket S3
│   ├── seed_db.py         # Données de démo
│   └── bd.sql             # Schéma SQL initial
└── s3example/             # Exemple configuration SeaweedFS
    ├── docker-compose.yaml
    ├── s3.json
    └── data/              # Données persistantes (créé automatiquement)
```

### Patrons d'architecture (SOLID)

#### Controller (Présentation HTTP)
- Gère uniquement HTTP (request/response)
- **Aucune logique métier**
- Valide les inputs via **DTO Pydantic**
- Appelle uniquement les **services** ou **domain_services**
- Retourne des **DTO** sérialisés

#### Service (Logique métier)
- Contient la **logique applicative**
- Indépendant du framework Flask
- Appelle les **repositories** pour accéder aux données
- Utilise les **mappers** pour convertir DAO ↔ DTO
- Lève des **exceptions métier** explicites

#### Domain Service (Logique transverse)
- Orchestration de logique complexe impliquant **plusieurs entités**
- Exemples : génération de flashcards depuis une note, calcul de statistiques de révision

#### Repository (Accès données)
- Encapsule les requêtes SQLAlchemy
- Pas de logique métier
- Retourne des **entités DAO** (modèles SQLAlchemy)
- Supporte filtres/tri/pagination

#### DAO (Modèle de données)
- Entités SQLAlchemy (modèles de base de données)
- Utilisent des **Mixins** pour partager des propriétés communes :
  - `UUIDMixin` : ID au format UUID v4
  - `TimestampMixin` : `created_at`, `updated_at`
  - `OwnerMixin` : `owner_id` (FK vers `users`)
  - `VisibilityMixin` : `visibility` (private/public)
  - `TagsMixin` : `tags` (array PostgreSQL)

#### DTO (Data Transfer Object)
- Modèles **Pydantic** pour validation/sérialisation
- Format API ↔ Client
- Variantes : `CreateDTO`, `UpdateDTO`, `ReadDTO`

#### Mapper
- Conversion **DAO ↔ DTO**
- Aucune logique métier
- Méthodes statiques ou fonctions pures

#### Query
- Requêtes SQLAlchemy complexes isolées
- Permet la réutilisation et le testing

#### Exceptions
- Héritent de **`werkzeug.exceptions.HTTPException`**
- Codes HTTP explicites (404, 403, 409...)
- Messages clairs et exploitables

---

## 8) Modèles & règles métier

### Modèles SQLAlchemy principaux

#### User ([user_dao.py](daos/user_dao.py))
```python
class User(UUIDMixin, CreatedAtMixin, Base):
    email: str              # Unique, obligatoire
    username: str | None    # Unique, optionnel
    password_hash: str      # Hash bcrypt
    role: RoleEnum          # 'client' ou 'admin'
    last_login: datetime | None
```

#### Note ([note_dao.py](daos/note_dao.py))
```python
class Note(UUIDMixin, OwnerMixin, VisibilityMixin, TagsMixin, TimestampMixin, Base):
    collection_id: str | None  # FK vers Collection
    title: str                 # Max 255 caractères
    content: str               # Texte riche (HTML/Markdown)
    visibility: VisibilityEnum # 'private' | 'public'
    tags: list[str]            # Array PostgreSQL
```

**Contraintes** :
- Titre unique **par collection** (constraint `uniq_note_title_per_collection`)
- Cascade delete si collection supprimée

#### Collection ([collection_dao.py](daos/collection_dao.py))
```python
class Collection(UUIDMixin, OwnerMixin, VisibilityMixin, TagsMixin, TimestampMixin, Base):
    title: str
    description: str
    color: str | None  # Code couleur hex (#FF5733)
```

#### Flashcard ([flashcard_dao.py](daos/flashcard_dao.py))
```python
class Flashcard(UUIDMixin, TimestampMixin, Base):
    note_id: str         # FK vers Note
    question: str
    answer: str
    difficulty: int      # Niveau de difficulté (1-5)
```

#### Review (système de révision espacée)
```python
class Review(UUIDMixin, CreatedAtMixin, Base):
    user_id: str
    flashcard_id: str
    success: bool           # Réussite/échec
    response_time_ms: int   # Temps de réponse
```

### Clés étrangères & contraintes importantes

- **UUID v4** pour tous les IDs (via `UUIDMixin`)
- **Cascade delete** sur tous les `ForeignKey` (`ondelete="CASCADE"`)
- **Indexes** sur FK et champs fréquemment filtrés (`owner_id`, `collection_id`)
- **UniqueConstraint** sur titre de note par collection

---

## 9) DTO & validation

### DTO Pydantic

Structure typique pour chaque entité :

```python
# Création (input)
class NoteCreateDTO(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default="")
    collection_id: str | None = None
    tags: list[str] = Field(default_factory=list)
    visibility: VisibilityEnum = VisibilityEnum.PRIVATE

# Mise à jour (input partiel)
class NoteUpdateDTO(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    content: str | None = None
    tags: list[str] | None = None
    visibility: VisibilityEnum | None = None

# Lecture (output)
class NoteReadDTO(BaseModel):
    id: str
    title: str
    content: str
    owner_id: str
    collection_id: str | None
    tags: list[str]
    visibility: VisibilityEnum
    created_at: datetime
    updated_at: datetime
```

### Validation automatique

- Les **controllers** utilisent Pydantic pour valider les inputs
- Erreurs de validation → **422 Unprocessable Entity**
- Exemple : `NoteCreateDTO(**request.json)`

### Dates

- Format **ISO 8601** (`2025-01-11T18:30:00Z`)
- Timezone **UTC** par défaut
- Conversion automatique via Pydantic

---

## 10) Mappers

### Localisation

Fichiers dans [`mappers/`](mappers/) :
- [`note_mapper.py`](mappers/note_mapper.py)
- [`collection_mapper.py`](mappers/collection_mapper.py)
- [`flashcard_mapper.py`](mappers/flashcard_mapper.py)
- etc.

### Exemple

```python
# DAO → DTO
def note_dao_to_read_dto(note: Note) -> NoteReadDTO:
    return NoteReadDTO(
        id=note.id,
        title=note.title,
        content=note.content,
        owner_id=note.owner_id,
        collection_id=note.collection_id,
        tags=note.tags,
        visibility=note.visibility,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )
```

---

## 11) Repositories (accès données)

### Fonctionnalités

Les repositories supportent :
- **Filtres dynamiques** (ownership, visibilité, tags, recherche texte)
- **Tri** (par date, titre, popularité)
- **Pagination** (offset/limit)

### Exemple — NoteRepository

```python
def find_many(
    user_id: str,
    collection_id: str | None = None,
    tags: list[str] | None = None,
    search: str | None = None,
    sort_by: str = "updated_at",
    order: str = "desc",
    limit: int = 50,
    offset: int = 0
) -> list[Note]:
    # ...
```

### Comportement en cas d'absence

- **`find_by_id`** retourne `None` si non trouvé
- Les **services** lèvent des **exceptions métier** (`NoteNotFound`, `CollectionNotFound`)

---

## 12) Contrôleurs (Flask)

### Blueprints exposés

Enregistrés dans [`app.py`](app.py#L83-L101) :

| Blueprint | Préfixe | Description |
|-----------|---------|-------------|
| `bp_sessions` | `/api/sessions` | Authentification (login/logout) |
| `bp_users` | `/api/users` | CRUD utilisateurs |
| `bp_notes` | `/api/notes` | CRUD notes |
| `bp_collections` | `/api/collections` | CRUD collections |
| `bp_note_shares` | `/api/note-shares` | Partage de notes (permissions) |
| `bp_note_share_links` | `/api/note-share-links` | Liens publics de notes |
| `bp_flashcards` | `/api/flashcards` | CRUD flashcards |
| `bp_reviews` | `/api/reviews` | Historique de révision |
| `bp_user_statistics` | `/api/statistics` | Statistiques utilisateur |

### Typage dans les routes

Flask supporte les convertisseurs d'URL :

```python
@bp_notes.route("/api/notes/<uuid:note_id>", methods=["GET"])
def get_note(note_id: str):
    # note_id est automatiquement validé comme UUID
```

### Schémas d'entrée/sortie

Documentés via **Swagger/Flasgger** (si `SWAGGER_ENABLED=1`).

Accès à la doc : **`http://localhost:5000/apidocs`**

---

## 13) Gestion des erreurs

### Error handler global

Implémenté dans [`utils/filter.py`](utils/filter.py#L14-L45) :

```python
@app.errorhandler(Exception)
def handle_any_exception(error: Exception):
    if isinstance(error, HTTPException):
        status_code = error.code
        message = error.description
    else:
        status_code = 500
        message = "Une erreur est survenue. Merci de réessayer plus tard."
    return jsonify({"code": status_code, "message": message}), status_code
```

### Comportement

- **`HTTPException`** → Retourne le code d'origine (404, 403, 409...)
- **Autres exceptions** → **500** avec message générique (en prod)
- **Rate limiting** → **429 Too Many Requests**
- **Validation Pydantic** → **422 Unprocessable Entity**
- **JWT invalide** → **401 Unauthorized**

### Exceptions custom

Héritent de `werkzeug.exceptions.HTTPException` :

```python
# exceptions/note_exception.py
from werkzeug.exceptions import NotFound, Forbidden, Conflict

class NoteNotFound(NotFound):
    description = "Note introuvable"

class NoteAccessDenied(Forbidden):
    description = "Accès refusé à cette note"

class NoteTitleConflict(Conflict):
    description = "Une note avec ce titre existe déjà dans cette collection"
```

**Localisation** : [`exceptions/`](exceptions/)

---

## 14) Base de donnees

### Moteur utilise

- **Developpement** : SQLite (`sqlite:///app.db`) par defaut (PostgreSQL possible)
- **Tests** : SQLite en memoire (`:memory:`)

### URL de connexion

Definie dans `.env` :

```env
SQLALCHEMY_DATABASE_URI=sqlite:///app.db
# Exemple Postgres :
# SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://postgres:password@localhost:5432/memora
```

### Creation du schema

#### En développement

Migrations manuelles (pour l'instant) :

```bash
# Option 1 : Via shell Python
python
>>> from utils.db import db, Base
>>> db.create_all()
```

#### En test

Création automatique via [`app.py`](app.py#L76-L78) :

```python
if config.IS_TEST:
    with app.app_context():
        db.create_all()
```

### Données de démo (seeds)

Un script de seed est disponible dans `scripts/seed_db.py` :

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Exécuter le script de seed
python scripts/seed_db.py
```

#### Utilisateurs créés par le seed

Le script crée 4 utilisateurs de test avec les identifiants suivants :

| Email | Username | Password | Rôle |
|-------|----------|----------|------|
| `superadmin@example.com` | `superadmin` | `SuperAdminPass123!` | SUPER_ADMIN |
| `admin@example.com` | `admin` | `AdminPass123!` | ADMIN |
| `alice@example.com` | `alice` | `AlicePass123!` | CLIENT |
| `bob@example.com` | `bob` | `BobPass123!!` | CLIENT |

**Note** : Ces comptes sont à usage de développement uniquement. Ne jamais utiliser ces identifiants en production.

---

## 15) Tests

### Stratégie de tests

- **Tests unitaires** : Services, mappers, repositories
- **Tests d'intégration** : Controllers (routes HTTP + WebSocket)

### Exécuter les tests

```bash
# Tous les tests
pytest

# Avec verbosité
pytest -v

# Avec coverage
pytest --cov=. --cov-report=html

# Tests spécifiques
pytest tests/controllers/note_tests/
```

### Configuration

Fichier [`pytest.ini`](pytest.ini) :

```ini
[pytest]
pythonpath = .
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### Base de données de test

- **SQLite en mémoire** (`:memory:`)
- Recréée automatiquement pour chaque session de test
- Fixtures pytest pour setup/teardown

---

## 16) Qualité & style

### Outils recommandés

| Outil | Usage | Commande |
|-------|-------|----------|
| **black** | Formatage code | `black .` |
| **ruff** | Linter (remplace flake8/pylint) | `ruff check .` |
| **isort** | Tri des imports | `isort .` |
| **mypy** | Type checking | `mypy .` (optionnel) |

### Installation (dev)

```bash
pip install black ruff isort mypy
```

### Conventions de nommage

- **Variables/fonctions** : `snake_case`
- **Classes** : `PascalCase`
- **Constantes** : `UPPER_SNAKE_CASE`
- **Pas d'abréviations** sauf standards (`id`, `dto`, `dao`)
- **Noms explicites** : `user_repository` > `user_repo`

---

## 17) Sécurité (minimum backend)

### CORS

Activé via **Flask-CORS** ([app.py](app.py#L40-L44)) :

```python
if config.ALLOWED_ORIGINS:
    origins = config.ALLOWED_ORIGINS.split(',')
    CORS(app, origins=origins, supports_credentials=True)
else:
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
```

**Origines autorisées** : Défini dans `.env` (`ALLOWED_ORIGINS`)

### Données sensibles à ne pas committer

- `.env` (déjà dans `.gitignore`)
- `logs/` (fichiers de logs)
- `uploads/` (images uploadées)
- `s3example/data/` (données SeaweedFS)
- `*.db` (bases SQLite locales)

### Politique d'erreurs

- **En production** : Messages génériques uniquement
- **En dev** : Messages détaillés pour debugging
- **Pas de stack traces** exposées au client

### Authentification

- **JWT** via Flask-JWT-Extended
- Tokens expirés après **24h** par défaut (`JWT_ACCESS_TOKEN_EXPIRES_SECONDS`)
- Rate limiting sur login/register (5 tentatives/min pour login)

---

## 18) Commandes utiles (dev)

### Démarrer le serveur

```bash
python app.py
```

### Démarrer Redis (si non démarré)

```bash
# Linux/macOS
redis-server

# Ou via Docker
docker run -d -p 6379:6379 redis:alpine
```

### Démarrer SeaweedFS (stockage S3)

```bash
cd s3example
sudo docker-compose -f docker-compose.yaml up -d
cd ..
python scripts/init_s3.py
```

### Reset DB (développement uniquement)

```bash
# Via shell Python
python
>>> from utils.db import db
>>> db.drop_all()
>>> db.create_all()
```

### Seed DB (données de démo)

```bash
python scripts/seed_db.py
```

### Lancer tests

```bash
pytest -v
```

### Formater le code

```bash
black .
isort .
```

### Linter

```bash
ruff check .
```

---

## 19) Déploiement (aperçu backend)

### Méthode cible

- **Recommandé** : Docker + Docker Compose
- **Alternatives** : PaaS (Heroku, Render, Railway)

### Variables d'environnement requises en prod

```env
SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://user:password@host:5432/memora
JWT_SECRET_KEY=<générer-secret-fort>
ALLOWED_ORIGINS=https://app.memora.com
REDIS_HOST=redis
REDIS_PORT=6379
STORAGE_DRIVER=s3
STORAGE_S3_BUCKET=memora-uploads
STORAGE_S3_ENDPOINT_URL=https://s3.amazonaws.com
STORAGE_S3_ACCESS_KEY=<aws-access-key>
STORAGE_S3_SECRET_KEY=<aws-secret-key>
STORAGE_S3_PUBLIC_BASE_URL=https://memora-uploads.s3.amazonaws.com
```

### Docker (exemple)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "--worker-class=eventlet", "-w", "1", "-b", "0.0.0.0:5000", "app:create_app()"]
```

---

## 20) Troubleshooting

### Problème : Port 5000 déjà utilisé

**Symptôme** : `Address already in use`

**Solution** :
```bash
# Trouver le processus utilisant le port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

### Problème : `.env` manquant

**Symptôme** : `JWT_SECRET_KEY must be set in production`

**Solution** :
```bash
cp .env.example .env
# Éditer .env et changer les valeurs par défaut
```

### Problème : Redis non disponible

**Symptôme** : `Error connecting to Redis`

**Solution** :
```bash
# Démarrer Redis (Linux/macOS)
redis-server

# Windows (via WSL ou Docker)
docker run -d -p 6379:6379 redis:alpine
```

### Problème : Erreur de connexion PostgreSQL

**Symptôme** : `could not connect to server`

**Solution** :
1. Vérifier que PostgreSQL est démarré
2. Vérifier `SQLALCHEMY_DATABASE_URI` dans `.env`
3. Tester la connexion :
   ```bash
   psql -h localhost -U postgres -d memora
   ```

### Problème : SeaweedFS ne démarre pas

**Symptôme** : Conteneur Docker en état `Restarting (255)`

**Solution** :
```bash
cd s3example

# Vérifier les logs
sudo docker logs seaweedfs

# Fixer les permissions du dossier data
sudo chmod -R 777 data/

# Supprimer et recréer le conteneur
sudo docker stop seaweedfs
sudo docker rm seaweedfs
sudo docker-compose -f docker-compose.yaml up -d
```

### Problème : Upload d'images échoue (404)

**Symptôme** : Upload réussit mais image retourne 404

**Solution** :
```bash
# 1. Vérifier que SeaweedFS tourne
sudo docker ps | grep seaweedfs

# 2. Initialiser le bucket S3
python scripts/init_s3.py

# 3. Vérifier les credentials dans .env
# STORAGE_S3_ACCESS_KEY et STORAGE_S3_SECRET_KEY doivent correspondre à s3.json

# 4. Tester l'accès S3
curl http://localhost:8333
```

### Diagnostic general

1. **Verifier les logs** : `tail -f logs/app.log`
2. **Tester Redis** : `redis-cli ping` -> `PONG`
3. **Tester SeaweedFS** : `curl http://localhost:8333`

---

## 21) Collaboration temps réel (CRDT)

### Architecture

- **WebSocket** : Socket.IO (namespace `/collaboration`)
- **CRDT** : Yjs (encodage base64)
- **Persistence** : Redis + snapshots PostgreSQL
- **Background jobs** : Cleanup sessions + snapshots automatiques

### Handlers WebSocket

| Événement | Type | Description |
|-----------|------|-------------|
| `join_collaboration` | Emit | Rejoindre une session de collaboration |
| `leave_collaboration` | Emit | Quitter une session |
| `crdt_update` | Emit | Envoyer une mise à jour CRDT |
| `crdt_sync_request` | Emit | Demander une synchronisation complète |
| `collaboration_session` | Listen | État de la session (collaborateurs) |
| `collaboration_event` | Listen | Événements en temps réel (updates, presence) |
| `crdt_sync_reply` | Listen | Réponse de synchronisation |

### Flux de collaboration

1. Client rejoint avec `join_collaboration` + JWT collab
2. Backend initialise document CRDT (Yjs) si nécessaire
3. Client envoie modifications via `crdt_update`
4. Backend propage aux autres clients via `collaboration_event`
5. Résolution de conflits automatique (Yjs CRDT)
6. Snapshots périodiques en PostgreSQL (toutes les 30s)

### Fichiers clés

- [`controllers/realtime/`](controllers/realtime/) : Handlers WebSocket
- [`services/impl/realtime/crdt/`](services/impl/realtime/crdt/) : Services CRDT

---

## Ressources complémentaires

- **Documentation API** : `http://localhost:5000/apidocs` (si Swagger activé)
- **SeaweedFS Wiki** : [github.com/seaweedfs/seaweedfs/wiki](https://github.com/seaweedfs/seaweedfs/wiki)
- **Issues GitHub** : [github.com/memora/issues](https://github.com/memora/issues)

---

## Licence

License — Projet étudiant IUT Montreuil (PONNOU Yovanne, FELLAH Ariles 🥵, BOUQSI Karim, AGOGUE Armand, SASIKUMAR Vignesh)

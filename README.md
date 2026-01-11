# Mémora - Backend API

API REST Flask pour **Mémora**, une application web de prise de notes collaborative avec système de révision par flashcards et collaboration temps réel.

## Table des matières

- [Description](#description)
- [Technologies](#technologies)
- [Commandes rapides](#commandes-rapides)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancer l'application](#lancer-lapplication)
- [Documentation de l'API (Swagger)](#documentation-de-lapi-swagger)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [Architecture](#architecture)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Endpoints API](#endpoints-api)
- [Collaboration temps réel - Architecture technique](#collaboration-temps-réel---architecture-technique)
- [Dépannage](#dépannage)

## Description

Mémora est un projet étudiant (SAE S5) qui permet aux utilisateurs de :
- **Créer et organiser des notes** en markdown avec support d'images
- **Collaborer en temps réel** sur les notes avec d'autres utilisateurs (WebSocket + CRDT)
- **Organiser les notes en collections** thématiques
- **Créer des flashcards** pour la révision avec système de répétition espacée
- **Partager des notes et collections** avec d'autres utilisateurs (permissions READ/WRITE)
- **Lier des notes entre elles** pour créer un réseau de connaissances
- **Marquer des favoris** pour un accès rapide
- **Suivre ses statistiques** de révision et de progression
- **Signaler du contenu** inapproprié (système de modération)

## Technologies

- **Flask 3.0** - Framework web Python
- **PostgreSQL / MySQL** - Base de données relationnelle
- **SQLAlchemy 2.0** - ORM Python
- **Pydantic 2.12** - Validation de données
- **Flask-JWT-Extended** - Authentification par tokens JWT
- **Flask-SocketIO** - Communication WebSocket bidirectionnelle
- **pycrdt** - CRDT (Conflict-free Replicated Data Types) pour la collaboration temps réel
- **Redis** - Gestion des sessions et synchronisation temps réel
- **Flasgger** - Documentation Swagger/OpenAPI
- **bcrypt** - Hachage des mots de passe
- **SeaweedFS** - Stockage d'images (S3-compatible)
- **Pytest** - Tests unitaires et d'intégration

## Commandes rapides

```bash
# Installation
pip install -r requirements.txt

# Démarrer l'application
python app.py  # http://localhost:5000

# Tests
pytest                    # Tous les tests
pytest -v                 # Mode verbeux
pytest tests/test_*.py    # Test spécifique

# Git hooks
git config core.hooksPath .githooks  # Active pytest pre-push

# Scripts utilitaires
python scripts/seed_db.py    # Initialise la base de données
python scripts/init_s3.py    # Initialise S3 (optionnel)
```

## Prérequis

- Python 3.10 ou supérieur
- PostgreSQL 12+ ou MySQL 8+
- Redis (pour la collaboration temps réel)
- pip et venv
- (Optionnel) SeaweedFS pour le stockage d'images

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd SAE_S5_MEMORA_BACKEND_PONNOU_AGOGUE_BOUQSI_FELLAH_SASIKUMAR
```

### 2. Créer un environnement virtuel

```bash
python -m venv .venv
source .venv/bin/activate  # Sur Linux/Mac
# ou
.venv\Scripts\activate  # Sur Windows
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Installer et configurer PostgreSQL

#### Sur Linux (Ubuntu/Debian/Fedora)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Fedora/RHEL
sudo dnf install postgresql postgresql-server
sudo postgresql-setup --initdb

# Démarrer le service
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Démarrage automatique
```

**Configurer l'authentification :**

Éditer le fichier de configuration :
- Ubuntu/Debian : `/etc/postgresql/<version>/main/pg_hba.conf`
- Fedora/RHEL : `/var/lib/pgsql/data/pg_hba.conf`

Remplacer `peer` et `ident` par `md5` :

```conf
# "local" is for Unix domain socket connections only
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
```

Redémarrer PostgreSQL :

```bash
sudo systemctl restart postgresql
```

**Créer la base de données :**

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans psql, exécuter :
ALTER USER postgres WITH PASSWORD 'root';
CREATE DATABASE memora;
\q
```

#### Sur Windows

1. Télécharger PostgreSQL depuis [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Installer PostgreSQL avec l'installeur (garder le port 5432 par défaut)
3. Pendant l'installation, définir le mot de passe `root` pour l'utilisateur `postgres`
4. Ouvrir **pgAdmin 4** ou **SQL Shell (psql)** depuis le menu démarrer
5. Se connecter et exécuter :

```sql
CREATE DATABASE memora;
```

### 5. Installer et configurer Redis

Redis est nécessaire pour la collaboration temps réel.

#### Sur Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Sur Windows

1. Télécharger Redis depuis [github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. Installer et démarrer le service Redis

#### Vérifier que Redis fonctionne

```bash
redis-cli ping
# Doit retourner: PONG
```

### 6. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet (voir `env.example` pour un exemple complet) :

```bash
# Environnement
APP_ENV=dev

# Base de données (PostgreSQL)
SQLALCHEMY_DATABASE_URI='postgresql+psycopg2://postgres:root@localhost:5432/memora'

# Base de données de test
SQLALCHEMY_TEST_DATABASE_URI='postgresql+psycopg2://postgres:root@localhost:5432/memora_test'

# JWT
SECRET_KEY='votre_secret_key_ici'
JWT_SECRET_KEY='votre_jwt_secret_key_ici'

# Redis (pour la collaboration temps réel)
REDIS_URL='redis://localhost:6379/0'

# Swagger
SWAGGER_ENABLED='1'

# Stockage (optionnel - local par défaut)
STORAGE_TYPE='local'  # ou 's3' pour SeaweedFS
# S3_ENDPOINT_URL='http://localhost:8333'
# S3_ACCESS_KEY='your_access_key'
# S3_SECRET_KEY='your_secret_key'
# S3_BUCKET_NAME='memora'
```

### 7. Initialiser la base de données

```bash
python scripts/seed_db.py
```

Ce script va :
- Créer toutes les tables
- Insérer des données de test

**Utilisateurs de test créés :**
- `superadmin@example.com` / `SuperAdminPass123!` (SUPER_ADMIN)
- `admin@example.com` / `AdminPass123!` (ADMIN)
- `client@example.com` / `ClientPass123!` (CLIENT)

### 8. (Optionnel) Initialiser le stockage S3

Si vous utilisez SeaweedFS pour le stockage d'images :

```bash
python scripts/init_s3.py
```

Assurez-vous que les variables S3 sont configurées dans `.env` et que le gateway SeaweedFS (port 8333) est démarré.

## Lancer l'application

### Mode développement

```bash
python app.py
```

L'API sera accessible sur `http://localhost:5000`

> **Note:** L'environnement est déterminé par `APP_ENV` dans `.env` :
> - `APP_ENV=test` → utilise `SQLALCHEMY_TEST_DATABASE_URI` et crée automatiquement les tables
> - Autres environnements → utilise `SQLALCHEMY_DATABASE_URI`


## Documentation de l'API (Swagger)

Une fois l'application lancée, accédez à la documentation interactive Swagger :

**URL:** `http://localhost:5000/api/docs`

La documentation Swagger vous permet de :
- Visualiser tous les endpoints disponibles
- Tester l'API directement depuis le navigateur
- Voir les schémas de requêtes et réponses
- Comprendre les codes d'erreur

> **Note:** La documentation Swagger n'est disponible que si `SWAGGER_ENABLED='1'` dans le `.env`

## Tests

L'application utilise **pytest** pour les tests unitaires et d'intégration.

### Lancer tous les tests

```bash
pytest
```

### Lancer les tests en mode verbeux

```bash
pytest -v
```

### Lancer un fichier de test spécifique

```bash
pytest tests/test_note.py
```

### Lancer les tests en mode silencieux (utilisé par le hook pre-push)

```bash
pytest -q
```

### Git hooks automatiques

Pour activer les hooks pytest avant chaque push :

```bash
git config core.hooksPath .githooks
```

Le hook `.githooks/pre-push` exécutera automatiquement `pytest -q` avant chaque push et bloquera le push si les tests échouent.

## Structure du projet

```
memora_back/
├── app.py                      # Point d'entrée Flask (factory pattern)
├── config.py                   # Configuration (DB, JWT, S3, Redis, etc.)
├── conftest.py                 # Configuration pytest
├── controllers/                # HTTP endpoints (Flask Blueprints)
│   ├── auth_controller.py
│   ├── note_controller.py
│   ├── collection_controller.py
│   ├── flashcard_controller.py
│   ├── realtime_collaboration_controller.py  # WebSocket handlers
│   └── ...
├── domain_services/            # Logique métier
├── repositorys/                # Accès base de données
├── daos/                       # Data Access Objects (requêtes DB)
├── querys/                     # Requêtes SQL complexes isolées
├── dtos/                       # Data Transfer Objects (Pydantic)
├── mappers/                    # Conversion DTO ↔ Entity/Domain
├── exceptions/                 # Exceptions métier
├── utils/                      # Helpers
│   ├── db.py                  # Gestion base de données
│   ├── jwt_utils.py           # Gestion JWT
│   ├── logger.py              # Logger centralisé
│   ├── swagger.py             # Configuration Swagger
│   ├── crdt_service.py        # Service CRDT pour collaboration temps réel
│   └── ...
├── tests/                      # Tests pytest
│   ├── conftest.py
│   ├── test_note.py
│   └── ...
├── scripts/                    # Scripts utilitaires
│   ├── seed_db.py             # Initialisation base de données
│   └── init_s3.py             # Initialisation S3
├── .githooks/                  # Git hooks (pre-push avec pytest)
├── requirements.txt            # Dépendances Python
└── env.example                 # Exemple de configuration .env
```

## Architecture

L'application suit une **architecture en couches** stricte (SOLID) :

1. **Controllers** : Gèrent uniquement HTTP (request/response), appellent les domain_services
2. **Domain Services** : Contiennent la logique métier, indépendants de Flask
3. **Repositories** : Abstraient l'accès aux données
4. **DAOs** : Data Access Objects - requêtes base de données
5. **DTOs** : Transport de données uniquement (Pydantic pour validation)
6. **Mappers** : Conversion DTO ↔ Entity/Domain
7. **Exceptions** : Exceptions métier explicites avec gestion centralisée

## Fonctionnalités principales

### Authentification
- Inscription et connexion avec JWT
- Gestion des sessions
- Hash sécurisé des mots de passe (bcrypt)
- Endpoints : `/sessions`

### Notes
- CRUD complet sur les notes
- Support du markdown avec éditeur Tiptap
- Images attachées aux notes
- Visibilité PUBLIC/PRIVATE
- Tags et recherche
- Liens entre notes (relations)
- **Collaboration temps réel** avec WebSocket + CRDT
- Endpoints : `/notes`, `/notes/<id>/relations`, `/notes/<id>/images`

### Collaboration temps réel (WebSocket)
- Namespace `/collaboration` avec Flask-SocketIO
- **CRDT (pycrdt)** pour résolution automatique des conflits
- Support OT (Operational Transformation) legacy
- Synchronisation multi-utilisateurs en temps réel
- Gestion de curseurs et statut de frappe
- Handlers :
  - `join_collaboration` / `leave_collaboration`
  - `crdt_update` / `crdt_sync_request` (CRDT - recommandé)
  - `send_operation` (OT - legacy)
  - `cursor_position` / `typing_status`

### Collections
- Regroupement de notes
- Partage de collections entières
- Statistiques par collection
- Endpoints : `/collections`

### Flashcards
- Création de flashcards depuis les notes
- QCM et réponses multiples
- Système de révision
- Endpoints : `/flashcards`, `/notes/<id>/flashcards`

### Reviews
- Système de répétition espacée
- Suivi de la progression
- Statistiques de révision
- Endpoints : `/reviews`

### Partage
- Partage de notes individuelles
- Partage de collections
- Permissions READ/WRITE
- Liens de partage publics
- Endpoints : `/note-shares`, `/collection-shares`, `/note-share-links`, `/collection-share-links`

### Favoris
- Marquer notes et collections en favoris
- Endpoints : `/note-favorites`, `/collection-favorites`

### Statistiques
- Statistiques utilisateur (révisions, progression)
- Endpoints : `/user-statistics`

### Modération
- Signalement de contenu
- Système de reports avec raisons
- Gestion administrative
- Endpoints : `/reports`

### Utilisateurs et Rôles
- Gestion de profil utilisateur
- Système de rôles hiérarchiques (CLIENT, ADMIN, SUPER_ADMIN)
- Permissions granulaires selon les rôles
- Endpoints : `/users`

#### Rôles utilisateurs

L'application supporte **trois rôles** avec des permissions différentes :

1. **CLIENT** (rôle par défaut)
   - Créer, modifier et supprimer ses propres notes et collections
   - Créer et gérer ses flashcards
   - Partager ses ressources avec d'autres utilisateurs
   - Modifier son propre profil utilisateur
   - Supprimer son propre compte

2. **ADMIN** (administrateur)
   - Toutes les permissions CLIENT
   - Accès en lecture/écriture à toutes les ressources (notes, collections)
   - Modifier et supprimer n'importe quel utilisateur CLIENT
   - Gérer les reports et la modération
   - **Ne peut PAS** attribuer ou modifier le rôle ADMIN
   - **Ne peut PAS** modifier les utilisateurs SUPER_ADMIN

3. **SUPER_ADMIN** (super administrateur)
   - Toutes les permissions ADMIN
   - **Seul rôle pouvant attribuer ou modifier le rôle ADMIN**
   - Gestion complète des administrateurs
   - Contrôle total sur tous les utilisateurs et ressources

#### Règles de sécurité des rôles

- **Création de compte** : Tous les nouveaux comptes sont créés avec le rôle CLIENT
- **Changement de rôle** :
  - CLIENT → ADMIN : Nécessite un SUPER_ADMIN
  - CLIENT → SUPER_ADMIN : Nécessite un SUPER_ADMIN
  - ADMIN → CLIENT : Nécessite un SUPER_ADMIN
  - ADMIN → SUPER_ADMIN : Nécessite un SUPER_ADMIN
  - Tout changement CLIENT → CLIENT : Nécessite un ADMIN ou SUPER_ADMIN
- **Modification de profil** :
  - Un utilisateur peut modifier son propre profil (sauf son rôle)
  - Les ADMIN peuvent modifier les profils des utilisateurs CLIENT
  - Les SUPER_ADMIN peuvent modifier tous les profils et tous les rôles
- **Suppression de compte** :
  - Un utilisateur peut supprimer son propre compte
  - Les ADMIN peuvent supprimer les comptes CLIENT
  - Les SUPER_ADMIN peuvent supprimer tous les comptes

#### Restrictions d'accès aux endpoints

Certains endpoints sont restreints selon les rôles pour des raisons de sécurité :

**Endpoints réservés aux ADMIN et SUPER_ADMIN :**
- `GET /users` - Lister tous les utilisateurs
- `GET /reports` - Lister tous les signalements
- `GET /reports/<id>` - Voir un signalement spécifique
- `PATCH /reports/<id>` - Modifier un signalement (modération)

**Endpoints avec accès self-or-admin :**
- `GET /users/<id>` - Voir un utilisateur (soi-même ou admin)
- `PATCH /users/<id>` - Modifier un utilisateur (soi-même ou admin)
- `DELETE /users/<id>` - Supprimer un utilisateur (soi-même ou admin)

**Endpoints publics (authentifiés) :**
- `POST /notes/<id>/reports` - Signaler une note (tout utilisateur authentifié)
- `POST /collections/<id>/reports` - Signaler une collection (tout utilisateur authentifié)

## Endpoints API

Tous les endpoints sont documentés dans Swagger : `http://localhost:5000/api/docs`

**Registre des Blueprints (dans app.py)** :
- Auth : `/sessions`
- Users : `/users`
- Notes : `/notes`, `/notes/<id>/relations`, `/notes/<id>/images`
- Collections : `/collections`
- Sharing : `/note-shares`, `/collection-shares`, `/note-share-links`, `/collection-share-links`
- Favorites : `/note-favorites`, `/collection-favorites`
- Flashcards : `/flashcards`, `/notes/<id>/flashcards`
- Reviews : `/reviews`
- Statistics : `/user-statistics`
- Reports : `/reports`

## Collaboration temps réel - Architecture technique

### État actuel

Le backend supporte **deux systèmes de collaboration** :

#### 1. CRDT (Recommandé) ✅
- **Backend** : Implémenté et prêt
- **Frontend** : Non utilisé actuellement
- **Technologie** : pycrdt (basé sur Yrs/Yjs)
- **Avantages** :
  - Résolution automatique des conflits
  - Latence minimale
  - Pas de gestion de versions
  - Synchronisation efficace avec vecteurs d'état

#### 2. OT - Operational Transformation (Legacy) ⚠️
- **Backend** : Supporté pour compatibilité
- **Frontend** : Système actuellement utilisé
- **Problèmes connus** :
  - Lent en collaboration rapide
  - Gestion de versions séquentielles avec risque de conflits
  - File d'attente d'opérations avec latence

### Flux CRDT (backend prêt)

```
1. Client → join_collaboration → Serveur initialise document CRDT
2. Client → crdt_update → Modifications propagées aux autres
3. Client → crdt_sync_request → Reçoit delta depuis son état
4. Fusion automatique sans conflits
```

### Migration recommandée

**Frontend doit migrer vers CRDT pour résoudre les problèmes de performance** :
- Intégrer Yjs avec Tiptap Collaboration extension
- Remplacer `send_operation` par `crdt_update`
- Supprimer la file d'attente d'opérations

**Fichiers concernés** :
- Backend : `utils/crdt_service.py` (déjà implémenté)
- Backend : `controllers/realtime_collaboration_controller.py` (handlers CRDT prêts)
- Frontend : `features/collaboration/hooks/useCollaboration.ts` (à migrer)

## Dépannage

### Redis non disponible

**Symptômes** : Erreurs de connexion Redis, sessions de collaboration ne persistent pas

**Solution** :
```bash
# Vérifier Redis
redis-cli ping  # Doit retourner PONG

# Vérifier configuration dans .env
REDIS_URL='redis://localhost:6379/0'
```

### Tests échouent avant push

**Solution** :
```bash
pytest -v  # Mode verbeux pour voir détails
```

### Collaboration lente

**Cause** : Frontend utilise OT legacy au lieu de CRDT

**Solution** : Migrer le frontend vers CRDT (voir section "Collaboration temps réel")

## Auteurs

Projet réalisé par : Yovanne PONNOU, Armand AGOGUE, karim BOUQSI, Ariles FELLAH 🥵, Regan SASIKUMAR

## Licence

Projet étudiant - IUT SAE S5

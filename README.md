# Mémora - Backend API

API REST Flask pour **Mémora**, une application web de prise de notes collaborative avec système de révision par flashcards.

## Description

Mémora est un projet étudiant (SAE S5) qui permet aux utilisateurs de :
- **Créer et organiser des notes** en markdown avec support d'images
- **Organiser les notes en collections** thématiques
- **Créer des flashcards** pour la révision avec système de répétition espacée
- **Partager des notes et collections** avec d'autres utilisateurs (permissions READ/WRITE)
- **Lier des notes entre elles** pour créer un réseau de connaissances
- **Marquer des favoris** pour un accès rapide
- **Suivre ses statistiques** de révision et de progression
- **Signaler du contenu** inapproprié (système de modération)

## Technologies

- **Flask** - Framework web Python
- **PostgreSQL** - Base de données relationnelle
- **SQLAlchemy** - ORM Python
- **JWT** - Authentification par tokens
- **Swagger/OpenAPI** - Documentation interactive de l'API
- **bcrypt** - Hachage des mots de passe
- **SeaweedFS** - Stockage d'images (S3-compatible)

## Prérequis

- Python 3.10 ou supérieur
- PostgreSQL 12 ou supérieur
- pip et venv

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

### 5. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```bash
APP_ENV=dev
SQLALCHEMY_DATABASE_URI='postgresql+psycopg2://postgres:root@localhost:5432/memora'
SWAGGER_ENABLED='1'
```

### 6. Initialiser la base de données

```bash
python scripts/seed_db.py
```

Ce script va :
- Créer toutes les tables
- Insérer des données de test

**Utilisateurs de test créés :**
- `admin@example.com` / `AdminPass123!` (ADMIN)
- `alice@example.com` / `AlicePass123!` (CLIENT)
- `bob@example.com` / `BobPass123!!` (CLIENT)

### 7. (Optionnel) Initialiser le stockage S3

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

### Lancer tous les tests

```bash
pytest
```

## Structure du projet

```
.
├── app.py                  # Point d'entrée de l'application
├── config.py               # Configuration
├── controllers/            # Endpoints API (routes)
├── services/              # Logique métier
├── repositorys/           # Accès aux données
├── daos/                  # Modèles SQLAlchemy (ORM)
├── dtos/                  # Data Transfer Objects
├── mappers/               # Conversion DAO ↔ DTO
├── querys/                # Requêtes SQL complexes
├── utils/                 # Utilitaires (JWT, DB, logger, etc.)
├── exceptions/            # Exceptions personnalisées
├── tests/                 # Tests unitaires et d'intégration
└── scripts/               # Scripts d'initialisation
```

## Architecture

L'application suit une architecture en couches :

1. **Controllers** : Gèrent les requêtes HTTP et les réponses
2. **Services** : Contiennent la logique métier
3. **Repositories** : Abstraient l'accès aux données
4. **DAOs** : Modèles de base de données SQLAlchemy

## Fonctionnalités principales

### Authentification
- Inscription et connexion avec JWT
- Gestion des sessions
- Hash sécurisé des mots de passe (bcrypt)

### Notes
- CRUD complet sur les notes
- Support du markdown
- Images attachées aux notes
- Visibilité PUBLIC/PRIVATE
- Tags et recherche
- Liens entre notes

### Collections
- Regroupement de notes
- Partage de collections entières
- Statistiques par collection

### Flashcards
- Création de flashcards depuis les notes
- QCM et réponses multiples
- Système de révision

### Reviews
- Système de répétition espacée
- Suivi de la progression
- Statistiques de révision

### Partage
- Partage de notes individuelles
- Partage de collections
- Permissions READ/WRITE
- Liens de partage publics

### Modération
- Signalement de contenu
- Système de reports avec raisons
- Gestion administrative

## Auteurs

Projet réalisé par : Yovanne PONNOU, Armand AGOGUE, karim BOUQSI, Ariles FELLAH 🥵, Regan SASIKUMAR

## Licence

Projet étudiant - IUT SAE S5

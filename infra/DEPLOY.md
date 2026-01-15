# DEPLOY.md

Guide de deploiement en environnement cible (VM, serveur, cloud).
Pour l'installation locale, voir `INSTALL.md`. Pour l'exploitation, voir `EXPLOITATION.md`.

## Prerequis

- Docker Engine + Docker Compose v2
- Acces a un registre d'images (GHCR) ou capacite a build/push
- Stockage persistant pour Postgres et uploads
- Stockage S3 compatible si `STORAGE_DRIVER=s3`

## Etapes de deploiement

### 1) Choisir les images

Par defaut, `infra/docker-compose.yaml` reference :
- `ghcr.io/dut-info-montreuil/memora-backend:latest`
- `ghcr.io/dut-info-montreuil/memora-frontend:latest`

Si GHCR n'est pas accessible, builder vos propres images :

```bash
docker build -t memora-backend:<tag> .
```

Le depot frontend n'est pas present ici. Il faut utiliser le repo frontend
correspondant, puis mettre a jour l'image dans `infra/docker-compose.yaml`.

### 2) Configurer les variables

Le compose embarque des valeurs par defaut. Pour la prod, modifiez
`infra/docker-compose.yaml` ou externalisez via `env_file`.
La liste complete des variables est dans `.env.example`.

Variables essentielles :
- `JWT_SECRET_KEY`
- `ALLOWED_ORIGINS`
- `SQLALCHEMY_DATABASE_URI`
- `SWAGGER_ENABLED=0`

Redis (collaboration temps reel) :
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `COLLAB_SESSION_TTL_SECONDS`

Stockage :
- `STORAGE_DRIVER` = `local` ou `s3`
- `UPLOAD_LOCAL_ROOT`, `UPLOAD_PUBLIC_BASE_URL`
- `STORAGE_S3_BUCKET`, `STORAGE_S3_ENDPOINT_URL`, `STORAGE_S3_REGION`,
  `STORAGE_S3_ACCESS_KEY`, `STORAGE_S3_SECRET_KEY`, `STORAGE_S3_PUBLIC_BASE_URL`

### 3) Adapter ports et volumes

Ports exposes par defaut :
- API : 5000
- Frontend : 8080

Volumes persistants :
- `backend_data`
- `backend_uploads`
- `postgres_data`

Si vous utilisez un Postgres/Redis externe, desactivez les services locaux
du compose et adaptez les variables.

### 4) Demarrer sur la cible

Demarrer les services via Docker Compose en mode detache (voir `INSTALL.md`
pour la commande exacte).

Initialiser la base via `scripts/init_db.py` (voir `INSTALL.md`).

## Differences dev / prod

- `SWAGGER_ENABLED=0` en prod
- `JWT_SECRET_KEY` fort et unique
- `ALLOWED_ORIGINS` restreint aux domaines reels
- Postgres + Redis obligatoires en prod (pas de SQLite)
- `STORAGE_DRIVER=s3` recommande en prod

## Adaptation infra (VM, serveur, cloud)

- Reverse proxy / TLS non fournis (a mettre en place sur la cible)
- Strategie de sauvegarde a prevoir (Postgres + uploads/S3)
- Monitoring et alerting a definir (voir `EXPLOITATION.md`)

## Informations manquantes dans le repo

- Pas de tags d'images versionnes (compose reference `:latest`)
- Pas de configuration TLS/reverse proxy
- Pas d'outil de migration de schema
- Pas de procedure de backup/restore detaillee



# INSTALL.md

Objectif : installer et mettre en service Memora (backend + frontend) de maniere autonome, sans terminal ouvert.

## Prerequis

### Option Docker Compose (recommande)
- Docker Engine + Docker Compose v2
- Acces aux images GHCR si vous conservez les images `ghcr.io/...` du `infra/docker-compose.yaml`
- Ports disponibles : 5000 (API) et 8080 (frontend)
- Espace disque pour les volumes `backend_data`, `backend_uploads`, `postgres_data`

### Option sans Docker (systemd, Linux)
- Linux avec systemd
- Python 3.11 (reference : `Dockerfile`)
- PostgreSQL et Redis (reference : `infra/docker-compose.yaml` utilise postgres:16 et redis:7)
- Acces reseau vers Postgres/Redis

## Installation pas a pas (Docker Compose)

1) Adapter la configuration dans `infra/docker-compose.yaml` (secrets, CORS, stockage).
   Note : `.env.example` liste les variables supportees par l'application, mais
   le compose actuel utilise des valeurs en dur.

2) Demarrer les services en arriere-plan :

```bash
docker compose -f infra/docker-compose.yaml up -d
```

3) Initialiser la base et le compte super admin (recommande) :

```bash
docker compose -f infra/docker-compose.yaml run --rm backend python scripts/init_db.py --email admin@example.com --username admin --password "StrongPass123!"
```

4) Le service est autonome : vous pouvez fermer le terminal.
   Les services redemarrent automatiquement (restart: unless-stopped).

## Verification du bon fonctionnement

- Etat des conteneurs :

  ```bash
  docker compose -f infra/docker-compose.yaml ps
  ```

- API :

  ```bash
  curl http://localhost:5000
  ```

- Frontend : ouvrir `http://localhost:8080`

## Alternative sans Docker (systemd, Linux)

1) Installer les dependances Python dans le repo :

```bash
python -m venv venv
venv/bin/pip install -r requirements.txt
```

2) Creer un fichier d'environnement, par exemple `/etc/memora/backend.env`,
   en vous basant sur `.env.example` (au minimum : `SQLALCHEMY_DATABASE_URI`,
   `JWT_SECRET_KEY`, `ALLOWED_ORIGINS`, `REDIS_HOST`, `REDIS_PORT`).

3) Creer un service systemd (exemple a adapter) :

```ini
[Unit]
Description=Memora backend (gunicorn)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/memora-backend
EnvironmentFile=/etc/memora/backend.env
ExecStart=/opt/memora-backend/venv/bin/gunicorn -k gevent -w 1 -b 0.0.0.0:5000 "app:create_app()"
Restart=on-failure
User=memora
Group=memora

[Install]
WantedBy=multi-user.target
```

4) Activer et demarrer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now memora-backend
```

5) Initialiser la base (meme script que ci-dessus) :

```bash
venv/bin/python scripts/init_db.py --email admin@example.com --username admin --password "StrongPass123!"
```

6) Verification : `curl http://localhost:5000`

Note : le frontend n'est pas demarre par cette methode, il faut le deployer separement.

## Informations manquantes dans le repo

- Aucun fichier systemd fourni (exemple ci-dessus a creer).
- Aucune procedure officielle de gestion des secrets pour la prod (env_file/secret manager).

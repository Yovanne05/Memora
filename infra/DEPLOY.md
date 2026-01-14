# Memora – Guide de deploiement

Ce dossier contient un `docker-compose.yaml` avec l'image du frontend et du backend,
plus des exemples de configuration pour stockage local ou S3 compatible (SeaweedFS).
Le choix est exclusif: vous utilisez soit le stockage local, soit le S3 compatible.

## Prerequis

- Docker + Docker Compose
- Acces aux images GHCR
- Etre connecte a GHCR pour telecharger les images (ex: `docker login ghcr.io`)

## TL;DR

Suite de commandes pour demarrer rapidement en local :

```bash
# A la racine du projet
cp .env.example .env

# Demarrer les services
docker compose -f infra/docker-compose.yaml up -d

# Verifier que tout tourne
docker compose -f infra/docker-compose.yaml ps
```

## Lancer en mode local (uploads locaux)

1) Copier et adapter les variables (si besoin) dans `infra/docker-compose.yaml`
   ou placer un fichier `.env` a la racine du projet (meme dossier que `.env.example`)
2) Demarrer:

```bash
docker compose -f infra/docker-compose.yaml up -d
```

Le frontend est expose sur `http://localhost:8080` et l'API sur `http://localhost:5000`.

## Verifier que tout roule

- Conteneurs up:
  ```bash
  docker compose -f infra/docker-compose.yaml ps
  ```
- Logs backend (demarrage OK, pas d'erreurs):
  ```bash
  docker compose -f infra/docker-compose.yaml logs -f backend
  ```
- Frontend reachable:
  Ouvrez `http://localhost:8080`
- API reachable:
  ```bash
  curl http://localhost:5000
  ```

  (Si Swagger est active, la doc est sur `http://localhost:5000/apidocs`)

## Build local (images)

Si vous voulez build les images localement (sans GHCR) :

```bash
# Backend (depuis la racine du repo backend)
docker build -t memora-backend:local .

# Frontend (depuis le repo frontend)
docker build -t memora-frontend:local .
```

Ensuite, modifiez `infra/docker-compose.yaml` :

- `backend.image: memora-backend:local`
- `frontend.image: memora-frontend:local`

## Quand utiliser le build local

- Vous n'avez pas acces a GHCR (reseau ferme, credentials manquants).
- Vous faites des changements sur le code backend ou frontend.
- Vous devez build une image custom (config, patch, tag precis).

## Guide frontend (court)

- L'image utilisee est `ghcr.io/dut-info-montreuil/memora-frontend:latest`.
- Le service est expose sur `http://localhost:8080` (port 80 dans le conteneur).
- Si vous devez changer l'URL de l'API, reconstruisez l'image depuis le repo frontend
  avec la variable/environnement attendu par ce projet, puis remplacez l'image dans
  `infra/docker-compose.yaml`.

## Activer S3 / SeaweedFS

Optionnel mais recommande: utiliser un stockage S3 compatible (ex: SeaweedFS)
plutot que le stockage local. Cela evite de perdre les fichiers en cas de
recreation du container, facilite les sauvegardes et permet de scaler
plus facilement.
Dans `infra/docker-compose.yaml`:

- Decommenter le service `seaweedfs`
- Passer `STORAGE_DRIVER` a `s3`
- Renseigner `STORAGE_S3_*` (voir bloc commente dans `backend.environment`)
  Vous utilisez S3/SeaweedFS ou le stockage local, pas les deux.

### Configuration S3

- Creer le bucket (`STORAGE_S3_BUCKET`) en lecture/ecriture pour l'application.
  Le bucket ne doit pas etre en lecture seule: l'API doit pouvoir y ecrire.
- Les credentials (`STORAGE_S3_ACCESS_KEY` / `STORAGE_S3_SECRET_KEY`) doivent
  avoir au minimum les droits suivants: GetObject, PutObject, DeleteObject,
  ListBucket sur le bucket.
- Le bucket doit exposer une lecture publique des objets (GetObject) pour que
  les URLs publiques fonctionnent sans authentification. Sans URLs signees,
  seule la lecture publique doit etre autorisee.
- `STORAGE_S3_ENDPOINT_URL` pointe vers l'endpoint S3 (ex: `http://seaweedfs:8333`).
- `STORAGE_S3_PUBLIC_BASE_URL` est l'URL publique utilisee pour servir les fichiers
  (ex: `http://localhost:8333/memora-uploads`). Si non defini, l'API servira les fichiers.

Puis relancer:

```bash
docker compose -f infra/docker-compose.yaml up -d
```

## Notes de configuration

- `ALLOWED_ORIGINS` accepte une liste CSV ou `*`.
- `JWT_SECRET_KEY` doit etre change en production.
- Postgres est inclus dans le compose: pensez a bien configurer `SQLALCHEMY_DATABASE_URI`
  et les variables `POSTGRES_*` (utilisateur, mot de passe, base).
- Les volumes `backend_data` et `backend_uploads` persistent les donnees.

## Bonnes pratiques prod (rapide)

- Secrets: changez `JWT_SECRET_KEY` et les credentials Postgres/S3.
- CORS: fixez `ALLOWED_ORIGINS` sur le(s) domaine(s) exact(s).
- Stockage: preferez S3/MinIO a `local` et pensez a des backups.
- Reverse proxy: placez un proxy (Nginx/Traefik) avec TLS.
- Observabilite: surveillez les logs et ajoutez de l'alerte basique.
- Swagger: gardez `SWAGGER_ENABLED=0` en prod.

## Ressources utiles

- Docker Compose: https://docs.docker.com/compose/
- GHCR: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- SeaweedFS (S3): https://github.com/seaweedfs/seaweedfs/wiki
- Postgres: https://www.postgresql.org/docs/
- Redis: https://redis.io/docs/

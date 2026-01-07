# SAE_S5_MEMORA_BACKEND_PONNOU_AGOGUE_BOUQSI_FELLAH_SASIKUMAR

## Scripts
- `python scripts/init_s3.py` : initialise le bucket S3 (SeaweedFS) s'il n'existe pas et applique une policy de lecture publique sur les objets. Assure-toi que les variables S3 sont renseignées dans `.env` et que le gateway SeaweedFS (port 8333) est démarré.

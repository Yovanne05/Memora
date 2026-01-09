"""
Script pour ajouter la colonne 'content' à la table 'notes'
"""
from utils.db import get_db_session
from sqlalchemy import text

def add_content_column():
    """Ajoute la colonne content à la table notes si elle n'existe pas"""
    with get_db_session() as session:
        # Vérifier si la colonne existe déjà
        result = session.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'notes' AND column_name = 'content'"
        ))

        if result.fetchone():
            print("La colonne 'content' existe déjà dans la table 'notes'")
            return

        # Ajouter la colonne
        print("Ajout de la colonne 'content' à la table 'notes'...")
        session.execute(text(
            "ALTER TABLE notes ADD COLUMN content TEXT NOT NULL DEFAULT ''"
        ))
        session.commit()
        print("✓ Colonne 'content' ajoutée avec succès!")

if __name__ == "__main__":
    add_content_column()

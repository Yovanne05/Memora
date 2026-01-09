from utils.db import get_db_session
from sqlalchemy import text

with get_db_session() as session:
    result = session.execute(text(
        "SELECT column_name, data_type "
        "FROM information_schema.columns "
        "WHERE table_name = 'notes' "
        "ORDER BY ordinal_position"
    ))
    print("Colonnes de la table 'notes':")
    for row in result:
        print(f"  {row[0]}: {row[1]}")

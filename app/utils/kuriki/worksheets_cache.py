from typing import Any, Dict, List

from psycopg2.extras import Json


class WorksheetsCache:
    _loaded = False
    cache: Dict[int | str, Dict[str, Any]] = {}  # id_key -> { "data": {...}, "outcomes": [...] }

    @classmethod
    def load(cls, db_cursor, table_name="worksheets"):
        """
        Load all worksheets from the table into memory.
        """
        if cls._loaded:
            return

        db_cursor.execute(f"SELECT id_key, data, outcomes FROM {table_name};")
        rows = db_cursor.fetchall()

        cls.cache = {id_key: {"data": data, "outcomes": outcomes} for id_key, data, outcomes in rows}

        cls._loaded = True

    @classmethod
    def get_by_outcome(cls, outcome_id: str):
        """
        Return all worksheets that include the given outcome_id in their outcomes list.
        """
        if not cls._loaded:
            raise RuntimeError("WorksheetsCache not loaded. Call WorksheetsCache.load() first.")

        return {id_key: entry for id_key, entry in cls.cache.items() if outcome_id in entry.get("outcomes", [])}

    @classmethod
    def add(cls, db_cursor, id_key: int, data: dict, outcomes: List[str], table_name="worksheets"):
        try:
            db_cursor.execute(
                f"""
                INSERT INTO {table_name} (id_key, data, outcomes)
                VALUES (%s, %s, %s)
                ON CONFLICT (id_key)
                DO UPDATE SET data = EXCLUDED.data, outcomes = EXCLUDED.outcomes;
                """,
                (id_key, Json(data), outcomes),
            )
            cls.cache[id_key] = {"data": data, "outcomes": outcomes}
        except Exception as e:
            print(f"Error adding worksheet to cache: {e}")
            raise

    @classmethod
    def delete(cls, db_cursor, id_key: int, table_name="worksheets"):
        db_cursor.execute(f"DELETE FROM {table_name} WHERE id_key = %s;", (id_key,))
        cls.cache.pop(id_key, None)

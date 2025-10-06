from typing import Any, Dict, List


class LessonsCache:
    _loaded = False
    cache: Dict[int, Dict[str, Any]] = {}  # id_key -> { "data": {...}, "outcomes": [...] }

    @classmethod
    def load(cls, db_cursor, table_name="lessons"):
        """
        Load all lessons from the table into memory.
        """
        if cls._loaded:
            return

        db_cursor.execute(f"SELECT id_key, data, outcomes FROM {table_name};")
        rows = db_cursor.fetchall()

        cls.cache = {id_key: {"data": data, "outcomes": outcomes} for id_key, data, outcomes in rows}

        cls._loaded = True

    @classmethod
    def add(cls, db_cursor, id_key: int, data: dict, outcomes: List[str], table_name="lessons"):
        db_cursor.execute(
            f"""
            INSERT INTO {table_name} (id_key, data, outcomes)
            VALUES (%s, %s, %s)
            ON CONFLICT (id_key)
            DO UPDATE SET data = EXCLUDED.data, outcomes = EXCLUDED.outcomes;
            """,
            (id_key, data, outcomes),
        )
        cls.cache[id_key] = {"data": data, "outcomes": outcomes}

    @classmethod
    def delete(cls, db_cursor, id_key: int, table_name="lessons"):
        db_cursor.execute(f"DELETE FROM {table_name} WHERE id_key = %s;", (id_key,))
        cls.cache.pop(id_key, None)

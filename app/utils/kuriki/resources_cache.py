from typing import Dict, List


class ResourceCache:
    _loaded = False
    cache: Dict[str, List[str]] = {}  # outcome_id -> [url, url, url]

    @classmethod
    def load(cls, db_cursor, table_name="resources"):
        """
        Loads all resources into a dictionary where
        each outcome_id maps to a list of URLs.
        """
        if cls._loaded:
            return

        db_cursor.execute(f"SELECT url, outcome_id FROM {table_name};")
        rows = db_cursor.fetchall()

        cache: Dict[str, List[str]] = {}
        for url, outcome_id in rows:
            if outcome_id not in cache:
                cache[outcome_id] = []
            cache[outcome_id].append(url)

        cls.cache = cache
        cls._loaded = True

    @classmethod
    def add(cls, db_cursor, url: str, outcome_id: str, table_name="resources"):
        db_cursor.execute(
            f"INSERT INTO {table_name} (url, outcome_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
            (url, outcome_id),
        )
        cls.cache.setdefault(outcome_id, []).append(url)

    @classmethod
    def delete(cls, db_cursor, url: str, outcome_id: str, table_name="resources"):
        db_cursor.execute(
            f"DELETE FROM {table_name} WHERE url = %s AND outcome_id = %s;",
            (url, outcome_id),
        )
        if outcome_id in cls.cache and url in cls.cache[outcome_id]:
            cls.cache[outcome_id].remove(url)
            if not cls.cache[outcome_id]:
                del cls.cache[outcome_id]

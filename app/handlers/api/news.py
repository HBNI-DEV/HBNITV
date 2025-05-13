import json

import psycopg2

from app.config.environments import Environment
from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role


class NewsAPIHandler(BaseHandler):
    _db_checked = False
    _table_name = "news"

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.set_header("Content-Type", "application/json")

    def options(self):
        self.set_status(204)
        self.finish()

    def initialize(self):
        self.conn = psycopg2.connect(
            dbname=Environment.POSTGRES_DB,
            user=Environment.POSTGRES_USER,
            password=Environment.POSTGRES_PASSWORD,
            host=Environment.POSTGRES_HOST,
            port=Environment.POSTGRES_PORT,
        )
        self.conn.autocommit = True
        self.cur = self.conn.cursor()

        if not NewsAPIHandler._db_checked:
            self.ensure_database_and_table()
            NewsAPIHandler._db_checked = True

    def ensure_database_and_table(self):
        self.cur.execute("""
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'news'
        """)
        if not self.cur.fetchone():
            self.cur.execute("""
                CREATE TABLE news (
                    id TEXT PRIMARY KEY,
                    data JSONB NOT NULL
                )
            """)

    def get(self):
        try:
            news_id = self.get_argument("id", None)

            if news_id:
                self.cur.execute("SELECT data FROM news WHERE id = %s", (news_id,))
                result = self.cur.fetchone()
                if result:
                    self.write({"status": "success", "data": result[0]})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "News article not found"})
            else:
                self.cur.execute("SELECT id, data FROM news")
                results = self.cur.fetchall()
                self.write(
                    {
                        "status": "success",
                        "data": [{"id": row[0], "data": row[1]} for row in results],
                    }
                )
        except Exception as e:
            self.write_error_response(e)

    @require_role("admin", "super_admin")
    def post(self):
        try:
            payload = json.loads(self.request.body)
            news_id = payload.get("id")

            if not news_id:
                self.write_error_message(400, "Missing News ID")
                return

            self.cur.execute(
                """
                INSERT INTO news (id, data)
                VALUES (%s, %s)
                ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
            """,
                (news_id, json.dumps(payload)),
            )

            self.write({"status": "success", "id": news_id})
        except json.JSONDecodeError:
            self.write_error_message(400, "Invalid JSON")
        except Exception as e:
            self.write_error_response(e)

    @require_role("admin", "super_admin")
    def delete(self):
        try:
            news_id = self.get_argument("id", None)

            if not news_id:
                self.write_error_message(400, "Missing News ID")
                return

            self.cur.execute("DELETE FROM news WHERE id = %s", (news_id,))
            if self.cur.rowcount > 0:
                self.write({"status": "success", "message": f"News {news_id} deleted"})
            else:
                self.set_status(404)
                self.write({"status": "error", "message": "News article not found"})
        except Exception as e:
            self.write_error_response(e)

    def on_finish(self):
        if hasattr(self, "cur"):
            self.cur.close()
        if hasattr(self, "conn"):
            self.conn.close()

    def write_error_response(self, error):
        self.set_status(500)
        self.write({"status": "error", "message": str(error)})

    def write_error_message(self, status_code, message):
        self.set_status(status_code)
        self.write({"status": "error", "message": message})

import json

import psycopg2

from app.config.environments import Environment
from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role


class AssignmentAPIHandler(BaseHandler):
    _db_checked = False  # Class-level flag to avoid re-checking
    _table_name = "assignments"

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

        if not AssignmentAPIHandler._db_checked:
            self.ensure_database_and_table()
            AssignmentAPIHandler._db_checked = True

    def ensure_database_and_table(self):
        # Ensure we're connected to the correct database
        self.cur.execute("""
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'assignments'
        """)
        if not self.cur.fetchone():
            self.cur.execute("""
                CREATE TABLE assignments (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    data JSONB NOT NULL
                )
            """)

    def get(self):
        try:
            assignment_id = self.get_argument("id", None)

            if assignment_id:
                self.cur.execute(
                    "SELECT id, data FROM assignments WHERE id = %s AND user_id = %s",
                    (assignment_id, self.current_user_id),
                )
                result = self.cur.fetchone()
                if result:
                    self.write({"status": "success", "data": result[1]})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Assignment not found"})
            else:
                self.cur.execute("SELECT id, data FROM assignments")
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
            assignment_id = payload.get("id")

            if not assignment_id:
                self.write_error_message(400, "Missing Assignment ID")
                return

            self.cur.execute(
                """
                INSERT INTO assignments (id, user_id, data)
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
            """,
                (assignment_id, self.current_user_id, json.dumps(payload)),
            )

            self.write({"status": "success", "id": assignment_id})
        except json.JSONDecodeError:
            self.write_error_message(400, "Invalid JSON")
        except Exception as e:
            self.write_error_response(e)

    @require_role("admin", "super_admin")
    def delete(self):
        try:
            assignment_id = self.get_argument("id", None)

            if not assignment_id:
                self.write_error_message(400, "Missing Assignment ID")
                return

            self.cur.execute("DELETE FROM assignments WHERE id = %s", (assignment_id,))
            if self.cur.rowcount > 0:
                self.write(
                    {
                        "status": "success",
                        "message": f"Assignment {assignment_id} deleted",
                    }
                )
            else:
                self.set_status(404)
                self.write({"status": "error", "message": "Assignment not found"})
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

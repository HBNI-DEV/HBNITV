import psycopg2

from app.config.environments import Environment
from app.handlers.core.base import BaseHandler


class KurikiBaseHandler(BaseHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.set_header("Access-Control-Allow-Credentials", "true")
        self.set_header("Content-Type", "application/json")

    def options(self):
        self.set_status(204)
        self.finish()

    def initialize(self):
        self.conn = psycopg2.connect(
            dbname="kuriki",
            user=Environment.POSTGRES_USER,
            password=Environment.POSTGRES_PASSWORD,
            host=Environment.POSTGRES_HOST,
            port=Environment.POSTGRES_PORT,
        )
        self.conn.autocommit = True
        self.cur = self.conn.cursor()

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

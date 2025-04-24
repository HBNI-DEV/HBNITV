from app.handlers.base import BaseHandler
from app.handlers.require_role import require_role


class AdminPageHandler(BaseHandler):
    @require_role("admin", "superadmin")
    def get(self):
        self.write("Welcome admin!")

from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role


class AdminPageHandler(BaseHandler):
    @require_role("admin", "super_admin")
    def get(self):
        self.write("Welcome admin!")

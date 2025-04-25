from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role
from app.utils.colony_names import COLONY_NAMES


class RegisterPageHandler(BaseHandler):
    def prepare(self):
        role = self.current_role
        if not role:
            self.write_error(403, error_message="Unauthorized")
        if role not in ("admin", "super_admin"):
            self.write_error(403, error_message="Unauthorized")

    @require_role("admin", "super_admin")
    def get(self):
        self.render_template("register.html", colony_names=COLONY_NAMES)

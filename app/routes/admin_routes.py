from app.handlers.core.base import BaseHandler
from app.routes.helpers import route
from app.utils.shared_folders import get_cache_from_db
from app.utils.users_cache import get_organizational_units_cache


class SharedFoldersHandler(BaseHandler):
    def get(self):
        folder_cache = get_cache_from_db()
        self.render_template(
            "shared_folders.html",
            folder_cache=folder_cache,
            organizational_units=get_organizational_units_cache(),
        )


class RegisterHandler(BaseHandler):
    def get(self):
        self.render_template(
            "register.html",
            organizational_units=get_organizational_units_cache(),
        )


admin_routes = [
    route(
        r"/admin/register",
        RegisterHandler,
        name="admin_register",
    ),
    route(
        r"/admin/shared/folders",
        SharedFoldersHandler,
    ),
]

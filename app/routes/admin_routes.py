from app.handlers.generic_page import GenericPageHandler
from app.routes.helpers import route
from app.utils.colony_names import COLONY_NAMES
from app.utils.users_cache import organizational_units_cache, users_cache

admin_routes = [
    route(
        r"/admin",
        GenericPageHandler,
        name="admin",
        template_name="admin.html",
        required_roles=("admin", "super_admin"),
    ),
    route(
        r"/admin/register",
        GenericPageHandler,
        name="admin_register",
        template_name="register.html",
        required_roles=("admin", "super_admin"),
        extra_context={"colony_names": COLONY_NAMES},
    ),
    route(
        r"/admin/tools",
        GenericPageHandler,
        name="admin_tools",
        template_name="tools.html",
        required_roles=("admin", "super_admin"),
    ),
    route(
        r"/admin/assignments",
        GenericPageHandler,
        name="admin_assignments",
        template_name="assignments.html",
        required_roles=("admin", "super_admin"),
    ),
    route(
        r"/admin/assignment",
        GenericPageHandler,
        name="assignment",
        template_name="assignment.html",
        required_roles=("admin", "super_admin"),
    ),
    route(
        r"/admin/classes",
        GenericPageHandler,
        name="classes",
        template_name="classes.html",
        required_roles=("admin", "super_admin"),
        extra_context={
            "users": users_cache,
            "organizational_units": organizational_units_cache,
        },
    ),
]

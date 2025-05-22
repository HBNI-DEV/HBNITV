import json

from app.handlers.generic_page import GenericPageHandler
from app.routes.helpers import route
from app.utils.class_cache import classes_cache


def load_view_routes(config_path="app/routes/routes.json"):
    with open(config_path, "r") as f:
        pages = json.load(f)

    view_routes = []
    for page in pages:
        path = page["path"]
        template = page["template"]
        if template == "classes.html":
            view_routes.append(
                route(
                    path,
                    GenericPageHandler,
                    template_name=template,
                    extra_context={"classes": classes_cache},
                )
            )
        else:
            view_routes.append(route(path, GenericPageHandler, template_name=template))

    return view_routes


view_routes = load_view_routes()

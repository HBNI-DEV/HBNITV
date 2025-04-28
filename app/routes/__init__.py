from app.routes.admin_routes import admin_routes
from app.routes.api_routes import api_routes
from app.routes.static_routes import static_routes
from app.routes.view_routes import view_routes

url_patterns = api_routes + admin_routes + view_routes + static_routes

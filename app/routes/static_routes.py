from app.handlers.special.custom_static import CustomStaticFileHandler
from app.handlers.special.google_verification_handler import GoogleVerificationHandler
from app.handlers.special.manifest import ManifestHandler
from app.handlers.special.service_worker import ServiceWorkerHandler
from app.handlers.special.sitemap import SitemapHandler
from app.routes.helpers import route

static_routes = [
    route(r"/sitemap.xml", SitemapHandler),
    route(r"/manifest.json", ManifestHandler),
    route(r"/service-worker.js", ServiceWorkerHandler),
    route(
        r"/google1a0dfeb96678ee94.html",
        GoogleVerificationHandler,
    ),
    route(r"/static/(.*)", CustomStaticFileHandler, path="static"),
    route(r"/public/(.*)", CustomStaticFileHandler, path="public"),
    route(
        r"/(favicon\.ico|manifest\.json|robots\.txt|apple-touch-icon\.png|service-worker\.js\.map|workbox-.*\.js|workbox-.*\.js\.map)",
        CustomStaticFileHandler,
        path="public",
    ),
]

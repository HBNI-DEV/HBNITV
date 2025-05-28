import asyncio

from tornado.httpserver import HTTPServer
from tornado.web import Application

from app.config.environments import Environment
from app.routes import url_patterns
from app.utils.class_cache import start_cache_updater, update_class_cache
from app.utils.google_api import start_folder_cache_updater


class TornadoApp(Application):
    def __init__(self):
        super().__init__(
            url_patterns,
            cookie_secret="hbni-itv-secret",
            static_hash_cache=True,
        )


async def main():
    update_class_cache()
    start_cache_updater()
    start_folder_cache_updater()

    print(f"🔧 Starting Tornado on port {Environment.PORT}...")
    app = TornadoApp()
    http_server = HTTPServer(app)
    http_server.listen(Environment.PORT)

    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())

import asyncio

from tornado.httpserver import HTTPServer
from tornado.options import define, options
from tornado.web import Application

from app.config.environments import Environment
from app.routes import url_patterns
from app.utils.organize_media import start_organizer
from app.utils.recordings_cache import (
    start_recordings_cache_updater,
    update_recordings_cache,
)
from app.utils.shared_folders import start_folder_cache_updater
from app.utils.users import start_user_cleanup
from app.utils.users_cache import start_users_cache_updater

define("compress_response", default=True, help="Enable Gzip compression")


class TornadoApp(Application):
    def __init__(self):
        super().__init__(
            url_patterns,
            cookie_secret="hbni-itv-secret",
            static_hash_cache=True,
            compress_response=options.compress_response,
        )


async def main():
    print("Starting cache updaters...")
    update_recordings_cache()
    start_users_cache_updater()
    start_recordings_cache_updater()
    start_folder_cache_updater()
    start_organizer()
    start_user_cleanup()

    print(f"Starting Tornado on port {Environment.PORT}...")
    app = TornadoApp()
    http_server = HTTPServer(app)
    http_server.listen(Environment.PORT)

    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())

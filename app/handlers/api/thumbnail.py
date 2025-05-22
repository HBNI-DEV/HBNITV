import aiohttp

from app.handlers.core.base import BaseHandler


class ThumbnailProxyHandler(BaseHandler):
    async def get(self):
        thumbnail_link = self.get_argument("link")

        async with aiohttp.ClientSession() as session:
            async with session.get(thumbnail_link) as response:
                if response.status == 200:
                    self.set_header(
                        "Content-Type",
                        response.headers.get("Content-Type", "image/jpeg"),
                    )
                    self.set_header("Cache-Control", "public, max-age=86400")
                    self.write(await response.read())
                else:
                    self.set_status(response.status)

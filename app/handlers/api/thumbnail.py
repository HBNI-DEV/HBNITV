import os

import aiohttp

from app.handlers.core.base import BaseHandler


class ThumbnailProxyHandler(BaseHandler):
    async def get(self):
        thumbnail_link = self.get_argument("link")

        safe_filename = thumbnail_link.split("/")[-1]
        file_path = os.path.join("static", "thumbnails", f"{safe_filename}.jpg")

        # Serve cached file if it exists
        if os.path.exists(file_path):
            self.set_header("Content-Type", "image/jpeg")
            self.set_header("Cache-Control", "public, max-age=604800")
            with open(file_path, "rb") as f:
                self.write(f.read())
            return

        # Ensure directory exists
        os.makedirs("static/thumbnails", exist_ok=True)

        # Download and cache the image
        async with aiohttp.ClientSession() as session:
            async with session.get(thumbnail_link) as response:
                if response.status == 200:
                    content_type = response.headers.get("Content-Type", "image/jpeg")
                    data = await response.read()

                    # Save image
                    with open(file_path, "wb") as f:
                        f.write(data)

                    self.set_header("Content-Type", content_type)
                    self.set_header("Cache-Control", "public, max-age=604800")
                    self.write(data)
                else:
                    self.set_status(response.status)

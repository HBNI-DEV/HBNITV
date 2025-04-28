from app.handlers.core.base import BaseHandler


class ManifestHandler(BaseHandler):
    def get(self):
        try:
            self.set_header("Content-Type", "application/json")
            with open("manifest.json", "rb") as f:
                self.write(f.read())
        except Exception as e:
            self.set_status(500)
            self.write(f"An error occurred: {str(e)}")

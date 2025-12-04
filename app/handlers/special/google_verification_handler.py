import os

from app.handlers.core.base import BaseHandler


class GoogleVerificationHandler(BaseHandler):
    def get(self):
        filename = "google9d968a11b4bf61f7.html"
        file_path = os.path.join(os.path.dirname(__file__), filename)
        try:
            self.set_header("Content-Type", "text/html")
            with open(file_path, "rb") as f:
                self.write(f.read())
            self.finish()
        except FileNotFoundError:
            # Handle the case where the file is missing
            self.set_status(404)
            self.write(f"Error: Verification file '{filename}' not found.")
            self.finish()
        except Exception as e:
            # Handle other potential errors (like permissions)
            self.set_status(500)
            self.write(f"An internal server error occurred while serving the file: {str(e)}")
            self.finish()

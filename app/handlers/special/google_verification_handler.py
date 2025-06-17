from app.handlers.core.base import BaseHandler


class GoogleVerificationHandler(BaseHandler):
    def get(self):
        try:
            self.set_header("Content-Type", "application/json")
            with open("google1a0dfeb96678ee94.html", "rb") as f:
                self.write(f.read())
        except Exception as e:
            self.set_status(500)
            self.write(f"An error occurred: {str(e)}")
